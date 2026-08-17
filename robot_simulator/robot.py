import socketio
import requests
import time
import threading
import os
import cv2
import random

from flask import Flask, Response
from datetime import datetime


# ============================================================
# CONFIGURATION
# ============================================================

SERVER_URL = "http://localhost:3001"

INSPECTION_URL = f"{SERVER_URL}/inspection/recevoir"

ROBOT_TOKEN = "robot_secret_12345"

CAMERA_PORT = 5000

ROBOT_ID = "ROBOT_01"


# ============================================================
# DOSSIERS
# ============================================================

ROBOT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

CAPTURES_DIR = os.path.join(
    ROBOT_DIR,
    "captures"
)

TOP_DIR = os.path.join(
    CAPTURES_DIR,
    "top"
)

BOTTOM_DIR = os.path.join(
    CAPTURES_DIR,
    "bottom"
)

os.makedirs(TOP_DIR, exist_ok=True)
os.makedirs(BOTTOM_DIR, exist_ok=True)


print("")
print("======================================")
print(" DOSSIERS CAPTURES")
print("======================================")
print("Robot    :", ROBOT_DIR)
print("Captures :", CAPTURES_DIR)
print("TOP      :", TOP_DIR)
print("BOTTOM   :", BOTTOM_DIR)
print("======================================")


# ============================================================
# CAMERA
# ============================================================

camera = None

latest_frame = None

camera_lock = threading.Lock()

camera_ready = False


# ============================================================
# ETAT INSPECTION
# ============================================================

production = None

operatorId = None

inspection_running = False

inspection_pause_event = threading.Event()

inspection_lock = threading.Lock()

inspection_thread = None


# ============================================================
# INFORMATIONS INSPECTION
# ============================================================

current_numero_sn = 0

current_nombre_sn = 0

current_sn = ""

current_progress = 0

current_remaining = 0

inspection_completed = 0

# ------------------------------------------------------------
# IMPORTANT :
# seconde exacte de la carte courante
# ------------------------------------------------------------

current_second = 0


# ============================================================
# OUVERTURE CAMERA
# ============================================================

def open_camera():

    global camera
    global camera_ready

    print("")
    print("======================================")
    print(" OUVERTURE CAMERA")
    print("======================================")

    if camera is not None:

        try:
            camera.release()
        except Exception:
            pass

        camera = None

        time.sleep(1)

    print(
        "Tentative ouverture caméra index 0..."
    )

    camera = cv2.VideoCapture(
        0,
        cv2.CAP_DSHOW
    )

    if not camera.isOpened():

        print(
            "⚠️ CAP_DSHOW impossible"
        )

        camera = cv2.VideoCapture(0)

    if not camera.isOpened():

        print(
            "❌ Impossible d'ouvrir webcam"
        )

        camera_ready = False

        return False

    camera.set(
        cv2.CAP_PROP_FRAME_WIDTH,
        640
    )

    camera.set(
        cv2.CAP_PROP_FRAME_HEIGHT,
        480
    )

    camera.set(
        cv2.CAP_PROP_FOURCC,
        cv2.VideoWriter_fourcc(*"MJPG")
    )

    camera.set(
        cv2.CAP_PROP_FPS,
        30
    )

    print(
        "Camera ouverte :",
        camera.isOpened()
    )

    print(
        "Largeur :",
        camera.get(
            cv2.CAP_PROP_FRAME_WIDTH
        )
    )

    print(
        "Hauteur :",
        camera.get(
            cv2.CAP_PROP_FRAME_HEIGHT
        )
    )

    print(
        "FPS :",
        camera.get(
            cv2.CAP_PROP_FPS
        )
    )

    print(
        "Stabilisation caméra..."
    )

    valid_frame = False

    for i in range(30):

        ret, frame = camera.read()

        if ret and frame is not None:

            mean_value = frame.mean()

            print(
                f"Frame {i + 1}/30 "
                f"| mean={mean_value:.2f}"
            )

            if frame.max() > 2:

                valid_frame = True

        time.sleep(0.05)

    camera_ready = valid_frame

    if camera_ready:

        print("✅ CAMERA PRETE")

    else:

        print(
            "⚠️ Camera ouverte mais frames noires"
        )

    print(
        "======================================"
    )

    return camera_ready


# ============================================================
# DEMARRAGE CAMERA
# ============================================================

if not open_camera():

    raise RuntimeError(
        "Impossible de démarrer la caméra."
    )


# ============================================================
# LECTURE CAMERA
# ============================================================

def camera_reader():

    global latest_frame
    global camera_ready

    print("")
    print("📷 Thread caméra démarré")

    compteur_erreur = 0

    while True:

        if camera is None:

            time.sleep(0.5)

            continue

        ret, frame = camera.read()

        if not ret or frame is None:

            compteur_erreur += 1

            print(
                "❌ Erreur caméra :",
                compteur_erreur
            )

            time.sleep(0.1)

            if compteur_erreur >= 20:

                print(
                    "⚠️ Reconnexion caméra..."
                )

                try:
                    camera.release()
                except Exception:
                    pass

                time.sleep(1)

                open_camera()

                compteur_erreur = 0

            continue

        compteur_erreur = 0

        if frame.max() > 2:

            with camera_lock:

                latest_frame = frame.copy()

            camera_ready = True

        time.sleep(0.03)


camera_thread = threading.Thread(
    target=camera_reader,
    daemon=True
)

camera_thread.start()


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)


def get_current_frame():

    with camera_lock:

        if latest_frame is None:

            return None

        return latest_frame.copy()


# ============================================================
# CAMERA STREAM
# ============================================================

def camera_stream():

    while True:

        frame = get_current_frame()

        if frame is None:

            time.sleep(0.03)

            continue

        ret, buffer = cv2.imencode(
            ".jpg",
            frame,
            [
                cv2.IMWRITE_JPEG_QUALITY,
                90
            ]
        )

        if not ret:

            continue

        jpg = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n"
            b"Cache-Control: no-cache\r\n"
            b"Pragma: no-cache\r\n\r\n"
            + jpg
            + b"\r\n"
        )


@app.route("/camera/top")
def camera_top():

    return Response(
        camera_stream(),
        mimetype=(
            "multipart/x-mixed-replace;"
            " boundary=frame"
        ),
        headers={
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }
    )


@app.route("/camera/bottom")
def camera_bottom():

    return Response(
        camera_stream(),
        mimetype=(
            "multipart/x-mixed-replace;"
            " boundary=frame"
        ),
        headers={
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }
    )


@app.route("/camera/snapshot")
def camera_snapshot():

    frame = get_current_frame()

    if frame is None:

        return (
            "Camera not ready",
            503
        )

    ret, buffer = cv2.imencode(
        ".jpg",
        frame,
        [
            cv2.IMWRITE_JPEG_QUALITY,
            95
        ]
    )

    if not ret:

        return (
            "Erreur encodage",
            500
        )

    return Response(
        buffer.tobytes(),
        mimetype="image/jpeg",
        headers={
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }
    )


def start_camera_server():

    print("")
    print("======================================")
    print(" CAMERA SERVER")
    print("======================================")

    print(
        "TOP      : "
        "http://localhost:5000/camera/top"
    )

    print(
        "BOTTOM   : "
        "http://localhost:5000/camera/bottom"
    )

    print(
        "SNAPSHOT : "
        "http://localhost:5000/camera/snapshot"
    )

    print("======================================")

    app.run(
        host="0.0.0.0",
        port=CAMERA_PORT,
        threaded=True,
        debug=False,
        use_reloader=False
    )


flask_thread = threading.Thread(
    target=start_camera_server,
    daemon=True
)

flask_thread.start()


# ============================================================
# SOCKET.IO
# ============================================================

sio = socketio.Client(
    reconnection=True,
    reconnection_attempts=0
)


# ============================================================
# SOCKET CONNECT
# ============================================================

@sio.event
def connect():

    print("")
    print("======================================")
    print("🤖 ROBOT CONNECTE AU BACKEND")
    print("======================================")

    sio.emit(
        "robot:connect",
        {
            "robotId": ROBOT_ID
        }
    )


@sio.on("robot:ready")
def robot_ready(data):

    print("")
    print("🤖 ROBOT READY")
    print(data)


@sio.event
def disconnect():

    print(
        "❌ Robot déconnecté"
    )


# ============================================================
# NOM FICHIER
# ============================================================

def generate_unique_filename(
    SN,
    PRF,
    position
):

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S_%f"
    )

    safe_sn = str(SN).replace(
        "/",
        "_"
    ).replace(
        "\\",
        "_"
    )

    safe_prf = str(PRF).replace(
        "/",
        "_"
    ).replace(
        "\\",
        "_"
    )

    return (
        f"{safe_sn}_"
        f"{safe_prf}_"
        f"{timestamp}_"
        f"{position}.jpg"
    )


# ============================================================
# SAUVEGARDE IMAGE
# ============================================================

def save_inspection_image(
    frame,
    SN,
    PRF,
    position
):

    if frame is None:

        return None

    if frame.max() <= 2:

        return None

    folder = (
        TOP_DIR
        if position == "TOP"
        else BOTTOM_DIR
    )

    filename = generate_unique_filename(
        SN,
        PRF,
        position
    )

    path = os.path.join(
        folder,
        filename
    )

    saved = cv2.imwrite(
        path,
        frame,
        [
            cv2.IMWRITE_JPEG_QUALITY,
            95
        ]
    )

    print(
        "📸 Image",
        position,
        "|",
        path,
        "| saved =",
        saved
    )

    if not saved:

        return None

    if position == "TOP":

        return (
            f"{SERVER_URL}"
            f"/captures/top/"
            f"{filename}"
        )

    return (
        f"{SERVER_URL}"
        f"/captures/bottom/"
        f"{filename}"
    )


# ============================================================
# ANALYSE
# ============================================================

def analyse_carte_aleatoire(
    zones_programme
):

    is_good = random.random() < 0.60

    if is_good:

        return (
            "GOOD",
            []
        )

    resultat = "NOT_GOOD"

    if not zones_programme:

        return (
            resultat,
            []
        )

    zones_valides = [

        zone

        for zone in zones_programme

        if zone.get("id")
        and zone.get("nom")
    ]

    if not zones_valides:

        return (
            resultat,
            []
        )

    types_defauts = [

        "Composant manquant",

        "Mauvaise soudure",

        "Composant déplacé",

        "Rayure",

        "Défaut de piste"
    ]

    nombre_defauts = random.randint(
        1,
        min(
            3,
            len(zones_valides)
        )
    )

    zones_selectionnees = random.sample(
        zones_valides,
        nombre_defauts
    )

    defauts = []

    for zone in zones_selectionnees:

        defauts.append(
            {
                "defautdetecte":
                    random.choice(
                        types_defauts
                    ),

                "zoneId":
                    zone["id"]
            }
        )

    return (
        resultat,
        defauts
    )


# ============================================================
# ATTENDRE FRAME
# ============================================================

def wait_for_valid_frame(
    timeout=5
):

    start_time = time.time()

    while (
        time.time() - start_time
        < timeout
    ):

        frame = get_current_frame()

        if frame is not None:

            if frame.max() > 2:

                return frame

        time.sleep(0.1)

    return None


# ============================================================
# ATTENDRE REPRISE
# ============================================================

def wait_if_paused():

    global inspection_running

    with inspection_lock:

        running = inspection_running

    if not running:

        return False

    print("")
    print("⏸️ INSPECTION EN PAUSE")
    print("⏳ En attente de REPRENDRE...")

    inspection_pause_event.wait()

    with inspection_lock:

        return inspection_running


# ============================================================
# START / REPRENDRE
# ============================================================

@sio.on("START")
def start(data):

    global production
    global operatorId

    global inspection_running
    global inspection_thread

    global current_nombre_sn

    print("")
    print("======================================")
    print("▶️ START / REPRENDRE")
    print("======================================")

    if not data:

        print("❌ START sans données")

        return

    new_production = data.get(
        "production"
    )

    new_operator = data.get(
        "operatorId"
    )

    # ========================================================
    # VERIFIER SI UNE INSPECTION EXISTE DEJA
    # ========================================================

    with inspection_lock:

        already_running = inspection_running

        current_production = production

    # ========================================================
    # REPRISE
    # ========================================================

    if already_running:

        if current_production is not None:

            current_prf = (
                current_production.get("PRF")
            )

            new_prf = (
                new_production.get("PRF")
                if new_production
                else data.get("PRF")
            )

            if (
                current_prf
                and new_prf
                and
                str(current_prf)
                ==
                str(new_prf)
            ):

                print("")
                print("======================================")
                print("🔄 REPRISE DE L'INSPECTION")
                print("======================================")

                with inspection_lock:

                    inspection_running = True

                inspection_pause_event.set()

                sio.emit(
                    "inspection:resumed",
                    {
                        "PRF":
                            current_prf,

                        "SN":
                            current_sn,

                        "numeroSN":
                            current_numero_sn,

                        "nombreSN":
                            current_nombre_sn,

                        "completed":
                            inspection_completed,

                        "remainingSN":
                            max(
                                current_nombre_sn
                                -
                                inspection_completed,
                                0
                            ),

                        "progress":
                            current_progress,

                        "remaining":
                            current_remaining,

                        "message":
                            "Inspection reprise"
                    }
                )

                print(
                    "✅ Event de reprise envoyé"
                )

                return

        print(
            "⚠️ Une autre inspection est déjà active"
        )

        return

    # ========================================================
    # NOUVELLE INSPECTION
    # ========================================================

    if not new_production:

        print(
            "❌ Production absente"
        )

        return

    production = new_production

    operatorId = new_operator

    with inspection_lock:

        inspection_running = True

        current_numero_sn = 0

        current_nombre_sn = 0

        current_sn = ""

        current_progress = 0

        current_remaining = 0

        inspection_completed = 0

        current_second = 0

    inspection_pause_event.set()

    print(
        "Production :",
        production
    )

    print(
        "Operator :",
        operatorId
    )

    inspection_thread = threading.Thread(
        target=inspection_loop,
        daemon=True
    )

    inspection_thread.start()

    print(
        "✅ Thread inspection démarré"
    )


# ============================================================
# STOP / PAUSE
# ============================================================

@sio.on("STOP")
def stop(data=None):

    global inspection_running

    print("")
    print("======================================")
    print("⏸️ STOP / PAUSE REÇU")
    print("======================================")

    PRF = (
        data.get("PRF")
        if data
        else (
            production.get("PRF")
            if production
            else None
        )
    )

    if not PRF:

        print(
            "❌ STOP sans PRF"
        )

        return

    with inspection_lock:

        if not inspection_running:

            print(
                "⚠️ Aucune inspection active"
            )

            return

        numero = current_numero_sn

        total = current_nombre_sn

        sn = current_sn

        progress = current_progress

        remaining = current_remaining

        completed = inspection_completed

        second = current_second

    # --------------------------------------------------------
    # IMPORTANT :
    #
    # inspection_running reste TRUE.
    #
    # On bloque seulement l'Event.
    # --------------------------------------------------------

    inspection_pause_event.clear()

    cartes_restantes = max(
        total - completed,
        0
    )

    print(
        "PRF              :",
        PRF
    )

    print(
        "SN actuel        :",
        sn
    )

    print(
        "Carte actuelle   :",
        f"{numero}/{total}"
    )

    print(
        "Seconde actuelle :",
        second
    )

    print(
        "Terminées        :",
        completed
    )

    print(
        "Restantes        :",
        cartes_restantes
    )

    print(
        "Progression      :",
        progress,
        "%"
    )

    print(
        "======================================"
    )

    sio.emit(
        "inspection:stopped",
        {
            "PRF":
                PRF,

            "SN":
                sn,

            "numeroSN":
                numero,

            "nombreSN":
                total,

            "completed":
                completed,

            "remainingSN":
                cartes_restantes,

            "progress":
                progress,

            "remaining":
                remaining,

            "second":
                second,

            "paused":
                True,

            "message":
                "Inspection mise en pause"
        }
    )


# ============================================================
# FIN INSPECTION
# ============================================================

def finish_inspection(
    PRF,
    nombreSN
):

    global inspection_running
    global inspection_completed
    global current_numero_sn
    global current_progress
    global current_remaining
    global current_second

    with inspection_lock:

        inspection_running = False

        inspection_completed = nombreSN

        current_numero_sn = nombreSN

        current_progress = 100

        current_remaining = 0

        current_second = 0

    inspection_pause_event.clear()

    print("")
    print("======================================")
    print("🏁 INSPECTION TERMINÉE")
    print("======================================")

    print(
        "PRF :",
        PRF
    )

    print(
        "Total :",
        nombreSN
    )

    print(
        "Terminées :",
        inspection_completed
    )

    print(
        "Restantes :",
        0
    )

    print("======================================")

    sio.emit(
        "inspection:finished",
        {
            "PRF":
                PRF,

            "nombreSN":
                nombreSN,

            "completed":
                nombreSN,

            "remainingSN":
                0,

            "progress":
                100,

            "message":
                "Toutes les inspections sont terminées"
        }
    )


# ============================================================
# BOUCLE INSPECTION
# ============================================================

def inspection_loop():

    global inspection_running

    global current_numero_sn
    global current_nombre_sn
    global current_sn
    global current_progress
    global current_remaining
    global inspection_completed
    global current_second

    # ========================================================
    # PRODUCTION
    # ========================================================

    if production is None:

        print(
            "❌ Production absente"
        )

        with inspection_lock:

            inspection_running = False

        return

    PRF = production.get(
        "PRF"
    )

    OF = production.get(
        "OF"
    )

    parametres = production.get(
        "parametres",
        {}
    )

    nombre_sn = (

        parametres.get("nombreSN")

        or production.get("nombreSN")

        or production.get("nombreSn")

        or production.get("quantite")

        or production.get("quantiteSN")

        or production.get("nombrePieces")

        or 1
    )

    try:

        nombre_sn = int(
            nombre_sn
        )

    except Exception:

        nombre_sn = 1

    if nombre_sn <= 0:

        nombre_sn = 1

    # ========================================================
    # INITIALISATION
    # ========================================================

    with inspection_lock:

        if current_nombre_sn == 0:

            current_nombre_sn = nombre_sn

    print("")
    print("======================================")
    print(" CONFIGURATION")
    print("======================================")

    print(
        "PRF       :",
        PRF
    )

    print(
        "OF        :",
        OF
    )

    print(
        "Nombre SN :",
        nombre_sn
    )

    print("======================================")

    sio.emit(
        "inspection:configuration",
        {
            "PRF":
                PRF,

            "nombreSN":
                nombre_sn
        }
    )

    # ========================================================
    # BOUCLE CARTES
    # ========================================================

    while True:

        # ----------------------------------------------------
        # VERIFIER FIN
        # ----------------------------------------------------

        with inspection_lock:

            completed = inspection_completed

            running = inspection_running

        if completed >= nombre_sn:

            finish_inspection(
                PRF,
                nombre_sn
            )

            return

        # ----------------------------------------------------
        # SI STOP
        # ----------------------------------------------------

        if not running:

            return

        # ----------------------------------------------------
        # SI PAUSE
        # ----------------------------------------------------

        if not inspection_pause_event.is_set():

            if not wait_if_paused():

                return

        # ----------------------------------------------------
        # NUMERO CARTE
        # ----------------------------------------------------

        numero = (
            inspection_completed + 1
        )

        with inspection_lock:

            current_numero_sn = numero

        SN = f"SNXXA{numero:05d}"

        # ----------------------------------------------------
        # IMPORTANT :
        #
        # On récupère la seconde existante.
        #
        # Pour une nouvelle carte = 0
        #
        # Pour une reprise = seconde où STOP a été fait.
        # ----------------------------------------------------

        with inspection_lock:

            if current_sn != SN:

                current_second = 0

            seconde = current_second

            current_sn = SN

            current_progress = int(
                (seconde / 30) * 100
            )

            current_remaining = max(
                30 - seconde,
                0
            )

        print("")
        print("======================================")
        print(
            f"🔎 INSPECTION {numero}/{nombre_sn}"
        )
        print("======================================")

        print(
            "SN :",
            SN
        )

        print(
            "Seconde de départ :",
            seconde
        )

        # ====================================================
        # INSPECTION COURANTE
        # ====================================================

        temps_total = 30

        image_top = None

        image_bottom = None

        # ====================================================
        # BOUCLE TEMPS
        # ====================================================

        while seconde < temps_total:

            # ------------------------------------------------
            # PAUSE
            # ------------------------------------------------

            if not inspection_pause_event.is_set():

                with inspection_lock:

                    current_second = seconde

                print(
                    f"⏸️ Pause à la seconde {seconde}"
                )

                if not wait_if_paused():

                    return

                print(
                    f"▶️ Reprise à la seconde {seconde}"
                )

                continue

            # ------------------------------------------------
            # VERIFIER RUNNING
            # ------------------------------------------------

            with inspection_lock:

                if not inspection_running:

                    return

            # ------------------------------------------------
            # PROGRESSION
            # ------------------------------------------------

            progress = int(
                (
                    (seconde + 1)
                    /
                    temps_total
                )
                * 100
            )

            remaining = (
                temps_total
                -
                seconde
                -
                1
            )

            with inspection_lock:

                current_progress = progress

                current_remaining = remaining

                current_numero_sn = numero

                current_sn = SN

                current_second = seconde

                completed = (
                    inspection_completed
                )

            cartes_restantes = (
                nombre_sn
                -
                completed
            )

            sio.emit(
                "inspection:progress",
                {
                    "PRF":
                        PRF,

                    "SN":
                        SN,

                    "progress":
                        progress,

                    "step":
                        "Analyse caméra TOP/BOTTOM",

                    "remaining":
                        remaining,

                    "numeroSN":
                        numero,

                    "nombreSN":
                        nombre_sn,

                    "completed":
                        completed,

                    "remainingSN":
                        cartes_restantes,

                    "second":
                        seconde
                }
            )

            # ------------------------------------------------
            # CAPTURE A LA 15ème SECONDE
            # ------------------------------------------------

            if seconde == 15:

                print(
                    "📸 Capture image"
                )

                frame = wait_for_valid_frame(5)

                if frame is not None:

                    image_top = (
                        save_inspection_image(
                            frame,
                            SN,
                            PRF,
                            "TOP"
                        )
                    )

                    image_bottom = (
                        save_inspection_image(
                            frame,
                            SN,
                            PRF,
                            "BOTTOM"
                        )
                    )

            # ------------------------------------------------
            # ATTENDRE 1 SECONDE
            # ------------------------------------------------

            time.sleep(1)

            # ------------------------------------------------
            # IMPORTANT :
            #
            # Si STOP pendant le sleep :
            #
            # on NE fait PAS seconde += 1
            #
            # La carte reprend exactement à cette seconde.
            # ------------------------------------------------

            if not inspection_pause_event.is_set():

                with inspection_lock:

                    current_second = seconde

                continue

            seconde += 1

            with inspection_lock:

                current_second = seconde

        # ====================================================
        # FIN DES 30 SECONDES
        # ====================================================

        with inspection_lock:

            current_second = 30

            current_progress = 100

            current_remaining = 0

        # ====================================================
        # VERIFIER PAUSE AVANT ANALYSE
        # ====================================================

        if not inspection_pause_event.is_set():

            if not wait_if_paused():

                return

        # ====================================================
        # ANALYSE
        # ====================================================

        zones = (
            production
            .get("programme", {})
            .get("zones", [])
        )

        resultat, defauts = (
            analyse_carte_aleatoire(
                zones
            )
        )

        print("")
        print("======================================")
        print("RESULTAT")
        print("======================================")

        print(
            "SN :",
            SN
        )

        print(
            "Resultat :",
            resultat
        )

        print(
            "Defauts :",
            defauts
        )

        # ====================================================
        # JSON INSPECTION
        # ====================================================

        inspection = {

            "SN":
                SN,

            "of":
                OF,

            "PRF":
                PRF,

            "operatorId":
                operatorId,

            "resultat":
                resultat,

            "tempsInspo":
                temps_total,

            "imagePathTop":
                image_top,

            "imagePathBottom":
                image_bottom,

            "defauts":
                defauts
        }

        # ====================================================
        # POST BACKEND
        # ====================================================

        try:

            response = requests.post(
                INSPECTION_URL,
                json=inspection,
                headers={
                    "x-robot-token":
                        ROBOT_TOKEN
                },
                timeout=10
            )

            print(
                "STATUS :",
                response.status_code
            )

            print(
                "RESPONSE :",
                response.text
            )

            if response.status_code not in [
                200,
                201
            ]:

                print(
                    "❌ Inspection non enregistrée"
                )

                # --------------------------------------------
                # NE PAS incrémenter completed.
                # La même carte sera réessayée.
                # --------------------------------------------

                with inspection_lock:

                    current_second = 0

                continue

            # =================================================
            # CARTE TERMINEE
            # =================================================

            with inspection_lock:

                inspection_completed = numero

                current_numero_sn = numero

                current_sn = SN

                current_progress = 100

                current_remaining = 0

                current_second = 0

                completed = (
                    inspection_completed
                )

            cartes_restantes = (
                nombre_sn
                -
                completed
            )

            # =================================================
            # EVENEMENT SAVED
            # =================================================

            saved_data = {

                "PRF":
                    PRF,

                "SN":
                    SN,

                "numeroSN":
                    numero,

                "nombreSN":
                    nombre_sn,

                "completed":
                    completed,

                "remainingSN":
                    cartes_restantes,

                "resultat":
                    resultat
            }

            sio.emit(
                "inspection:saved",
                saved_data
            )

            sio.emit(
                "inspection:new",
                saved_data
            )

            print("")
            print("======================================")
            print("✅ CARTE TERMINEE")
            print("======================================")

            print(
                "SN :",
                SN
            )

            print(
                "Terminées :",
                completed
            )

            print(
                "Restantes :",
                cartes_restantes
            )

            print("======================================")

        except Exception as e:

            print(
                "❌ Erreur POST :",
                e
            )

            continue

        # ====================================================
        # FIN ?
        # ====================================================

        if completed >= nombre_sn:

            finish_inspection(
                PRF,
                nombre_sn
            )

            return

        # ====================================================
        # PAUSE ENTRE CARTES
        # ====================================================

        print(
            "⏳ Passage à la prochaine carte..."
        )

        for _ in range(20):

            if not inspection_pause_event.is_set():

                print(
                    "⏸️ Pause entre deux cartes"
                )

                if not wait_if_paused():

                    return

            time.sleep(0.1)


# ============================================================
# DEMARRAGE
# ============================================================

print("")
print("======================================")
print("🤖 DEMARRAGE ROBOT SIMULATOR")
print("======================================")

try:

    time.sleep(2)

    test_frame = wait_for_valid_frame(5)

    if test_frame is None:

        print(
            "⚠️ Aucune frame caméra"
        )

    else:

        print(
            "✅ TEST CAMERA REUSSI"
        )

        print(
            "Taille :",
            test_frame.shape
        )

        print(
            "Mean :",
            test_frame.mean()
        )

    print(
        "Connexion backend..."
    )

    sio.connect(
        SERVER_URL
    )

    print(
        "✅ Socket connecté"
    )

    sio.wait()

except KeyboardInterrupt:

    print(
        "🛑 Robot arrêté manuellement"
    )

except Exception as e:

    print(
        "❌ Erreur robot :",
        e
    )

finally:

    inspection_pause_event.clear()

    with inspection_lock:

        inspection_running = False

    try:

        if camera is not None:

            camera.release()

    except Exception:

        pass

    print(
        "📷 Camera libérée"
    )