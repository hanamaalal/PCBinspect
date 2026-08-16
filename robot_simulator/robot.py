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

os.makedirs(
    TOP_DIR,
    exist_ok=True
)

os.makedirs(
    BOTTOM_DIR,
    exist_ok=True
)


print("")
print("======================================")
print(" DOSSIERS CAPTURES")
print("======================================")
print("Robot     :", ROBOT_DIR)
print("Captures  :", CAPTURES_DIR)
print("TOP       :", TOP_DIR)
print("BOTTOM    :", BOTTOM_DIR)
print("======================================")


# ============================================================
# CAMERA
# ============================================================

camera = None

latest_frame = None

camera_lock = threading.Lock()

camera_ready = False


# ============================================================
# OUVRIR CAMERA
# ============================================================

def open_camera():

    global camera
    global camera_ready

    print("")
    print("======================================")
    print(" OUVERTURE CAMERA")
    print("======================================")

    # --------------------------------------------------------
    # Fermer ancienne caméra
    # --------------------------------------------------------

    if camera is not None:

        try:
            camera.release()
        except Exception:
            pass

        camera = None

        time.sleep(1)


    # --------------------------------------------------------
    # Ouvrir webcam intégrée
    # --------------------------------------------------------

    print("Tentative ouverture caméra index 0...")

    camera = cv2.VideoCapture(
        0,
        cv2.CAP_DSHOW
    )


    if not camera.isOpened():

        print(
            "❌ Impossible d'ouvrir la caméra avec CAP_DSHOW"
        )

        # ----------------------------------------------------
        # Deuxième tentative
        # ----------------------------------------------------

        camera = cv2.VideoCapture(0)

    if not camera.isOpened():

        print(
            "❌ Impossible d'ouvrir la webcam"
        )

        camera_ready = False

        return False


    # --------------------------------------------------------
    # Configuration
    # --------------------------------------------------------

    camera.set(
        cv2.CAP_PROP_FRAME_WIDTH,
        640
    )

    camera.set(
        cv2.CAP_PROP_FRAME_HEIGHT,
        480
    )


    # --------------------------------------------------------
    # Format MJPG
    # --------------------------------------------------------

    camera.set(
        cv2.CAP_PROP_FOURCC,
        cv2.VideoWriter_fourcc(
            *"MJPG"
        )
    )


    # --------------------------------------------------------
    # FPS
    # --------------------------------------------------------

    camera.set(
        cv2.CAP_PROP_FPS,
        30
    )


    print("")
    print("Camera ouverte :", camera.isOpened())

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


    # --------------------------------------------------------
    # IMPORTANT :
    # laisser la webcam se stabiliser
    # --------------------------------------------------------

    print("")
    print("Stabilisation caméra...")

    valid_frame = False

    for i in range(30):

        ret, frame = camera.read()

        if ret and frame is not None:

            mean_value = frame.mean()

            print(
                f"Frame {i + 1}/30 "
                f"| mean={mean_value:.2f}"
            )

            if mean_value > 2:

                valid_frame = True

        time.sleep(0.05)


    if valid_frame:

        camera_ready = True

        print("")
        print("✅ CAMERA PRETE")

    else:

        camera_ready = False

        print("")
        print(
            "⚠️ Camera ouverte mais frames noires"
        )

        print(
            "Vérifie qu'aucun autre programme "
            "n'utilise la webcam."
        )


    print("======================================")

    return camera_ready


# ============================================================
# OUVERTURE CAMERA
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

        # ----------------------------------------------------
        # Vérifier caméra
        # ----------------------------------------------------

        if camera is None:

            time.sleep(0.5)

            continue


        # ----------------------------------------------------
        # Lire frame
        # ----------------------------------------------------

        ret, frame = camera.read()


        if not ret or frame is None:

            compteur_erreur += 1

            print(
                "❌ Erreur lecture caméra :",
                compteur_erreur
            )

            time.sleep(0.1)


            # ------------------------------------------------
            # Reconnexion après plusieurs erreurs
            # ------------------------------------------------

            if compteur_erreur >= 20:

                print(
                    "⚠️ Tentative reconnexion caméra..."
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


        # ----------------------------------------------------
        # Vérification image
        # ----------------------------------------------------

        mean_value = frame.mean()

        max_value = frame.max()

        min_value = frame.min()


        # ----------------------------------------------------
        # Si frame correcte
        # ----------------------------------------------------

        if max_value > 2:

            with camera_lock:

                latest_frame = frame.copy()

            camera_ready = True


        else:

            # ------------------------------------------------
            # Frame noire
            # ------------------------------------------------

            print(
                "⚠️ Frame noire détectée "
                f"| min={min_value} "
                f"| max={max_value} "
                f"| mean={mean_value:.2f}"
            )


        time.sleep(0.03)


# ============================================================
# THREAD CAMERA
# ============================================================

camera_thread = threading.Thread(
    target=camera_reader,
    daemon=True
)

camera_thread.start()


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)


# ============================================================
# FRAME ACTUELLE
# ============================================================

def get_current_frame():

    with camera_lock:

        if latest_frame is None:

            return None

        return latest_frame.copy()


# ============================================================
# STREAM CAMERA
# ============================================================

def camera_stream():

    while True:

        frame = get_current_frame()


        if frame is None:

            time.sleep(0.03)

            continue


        # ----------------------------------------------------
        # Encodage JPG
        # ----------------------------------------------------

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


# ============================================================
# CAMERA TOP
# ============================================================

@app.route("/camera/top")
def camera_top():

    return Response(

        camera_stream(),

        mimetype=(
            "multipart/x-mixed-replace; "
            "boundary=frame"
        ),

        headers={
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }

    )


# ============================================================
# CAMERA BOTTOM
# ============================================================

@app.route("/camera/bottom")
def camera_bottom():

    return Response(

        camera_stream(),

        mimetype=(
            "multipart/x-mixed-replace; "
            "boundary=frame"
        ),

        headers={
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }

    )


# ============================================================
# SNAPSHOT
# ============================================================

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
            "Erreur encodage image",
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


# ============================================================
# SERVEUR CAMERA
# ============================================================

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


# ============================================================
# THREAD FLASK
# ============================================================

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


production = None

operatorId = None

inspection_active = False


# ============================================================
# SOCKET CONNECT
# ============================================================

@sio.event
def connect():

    print("")
    print("======================================")
    print(" ROBOT CONNECTE AU BACKEND")
    print("======================================")


    sio.emit(

        "robot:connect",

        {
            "robotId": ROBOT_ID
        }

    )


# ============================================================
# SOCKET DISCONNECT
# ============================================================

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


    safe_sn = str(SN)

    safe_sn = safe_sn.replace(
        "/",
        "_"
    )

    safe_sn = safe_sn.replace(
        "\\",
        "_"
    )


    safe_prf = str(PRF)

    safe_prf = safe_prf.replace(
        "/",
        "_"
    )

    safe_prf = safe_prf.replace(
        "\\",
        "_"
    )


    filename = (

        f"{safe_sn}_"

        f"{safe_prf}_"

        f"{timestamp}_"

        f"{position}.jpg"

    )


    return filename


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

        print(
            "❌ Frame vide"
        )

        return None


    # --------------------------------------------------------
    # Vérification
    # --------------------------------------------------------

    print("")
    print("======================================")
    print(" VERIFICATION FRAME")
    print("======================================")

    print(
        "Shape :",
        frame.shape
    )

    print(
        "Min   :",
        frame.min()
    )

    print(
        "Max   :",
        frame.max()
    )

    print(
        "Mean  :",
        frame.mean()
    )

    print("======================================")


    # --------------------------------------------------------
    # Détection frame noire
    # --------------------------------------------------------

    if frame.max() <= 2:

        print(
            "❌ FRAME COMPLETEMENT NOIRE"
        )

        return None


    # --------------------------------------------------------
    # Dossier
    # --------------------------------------------------------

    if position == "TOP":

        folder = TOP_DIR

    else:

        folder = BOTTOM_DIR


    os.makedirs(
        folder,
        exist_ok=True
    )


    # --------------------------------------------------------
    # Nom
    # --------------------------------------------------------

    filename = generate_unique_filename(

        SN,

        PRF,

        position

    )


    # --------------------------------------------------------
    # Chemin
    # --------------------------------------------------------

    path = os.path.join(

        folder,

        filename

    )


    # --------------------------------------------------------
    # Sauvegarde
    # --------------------------------------------------------

    saved = cv2.imwrite(

        path,

        frame,

        [
            cv2.IMWRITE_JPEG_QUALITY,
            95
        ]

    )


    print("")
    print("======================================")
    print(" IMAGE SAUVEGARDEE")
    print("======================================")

    print(
        "SN       :",
        SN
    )

    print(
        "PRF      :",
        PRF
    )

    print(
        "Position :",
        position
    )

    print(
        "Path     :",
        path
    )

    print(
        "Saved    :",
        saved
    )

    print(
        "Existe   :",
        os.path.exists(path)
    )


    if os.path.exists(path):

        print(
            "Taille   :",
            os.path.getsize(path),
            "bytes"
        )


    print("======================================")


    if not saved:

        return None


    # --------------------------------------------------------
    # URL NestJS
    # --------------------------------------------------------

    if position == "TOP":

        url = (

            f"{SERVER_URL}"

            f"/captures/top/"

            f"{filename}"

        )

    else:

        url = (

            f"{SERVER_URL}"

            f"/captures/bottom/"

            f"{filename}"

        )


    print(
        "URL envoyée à NestJS :",
        url
    )


    return url


# ============================================================
# ANALYSE ALEATOIRE
# ============================================================

def analyse_carte_aleatoire(
    zones_programme
):

    is_good = (
        random.random()
        < 0.60
    )


    # --------------------------------------------------------
    # GOOD
    # --------------------------------------------------------

    if is_good:

        return (
            "GOOD",
            []
        )


    # --------------------------------------------------------
    # NOT GOOD
    # --------------------------------------------------------

    resultat = "NOT_GOOD"


    if not zones_programme:

        print(
            "⚠️ Aucune zone trouvée"
        )

        return (
            resultat,
            []
        )


    # --------------------------------------------------------
    # Zones valides
    # --------------------------------------------------------

    zones_valides = [

        zone

        for zone in zones_programme

        if zone.get("id")

        and zone.get("nom")

    ]


    if not zones_valides:

        print(
            "⚠️ Aucune zone valide"
        )

        return (
            resultat,
            []
        )


    # --------------------------------------------------------
    # Types défauts
    # --------------------------------------------------------

    types_defauts = [

        "Composant manquant",

        "Mauvaise soudure",

        "Composant déplacé",

        "Rayure",

        "Défaut de piste"

    ]


    # --------------------------------------------------------
    # Nombre défauts
    # --------------------------------------------------------

    nombre_defauts = random.randint(

        1,

        min(
            3,
            len(zones_valides)
        )

    )


    # --------------------------------------------------------
    # Zones sélectionnées
    # --------------------------------------------------------

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
# START INSPECTION
# ============================================================

@sio.on("START")
def start(data):

    global production
    global operatorId
    global inspection_active


    print("")
    print("======================================")
    print(" START INSPECTION")
    print("======================================")


    try:

        production = data["production"]

        operatorId = data["operatorId"]


    except Exception as e:

        print(
            "❌ Données START invalides :",
            e
        )

        return


    print(
        "Production :",
        production
    )

    print(
        "Operator :",
        operatorId
    )


    if inspection_active:

        print(
            "⚠️ Inspection déjà active"
        )

        return


    inspection_active = True


    threading.Thread(

        target=inspection_loop,

        daemon=True

    ).start()


# ============================================================
# STOP INSPECTION
# ============================================================

@sio.on("STOP")
def stop():

    global inspection_active


    print("")
    print(
        "🛑 STOP INSPECTION"
    )


    inspection_active = False


# ============================================================
# ATTENDRE UNE FRAME VALIDE
# ============================================================

def wait_for_valid_frame(
    timeout=5
):

    print("")
    print(
        "Recherche d'une frame valide..."
    )


    start_time = time.time()


    while (
        time.time() - start_time
        <
        timeout
    ):

        frame = get_current_frame()


        if frame is not None:

            mean_value = frame.mean()

            max_value = frame.max()


            print(
                f"Frame test "
                f"mean={mean_value:.2f} "
                f"max={max_value}"
            )


            if max_value > 2:

                print(
                    "✅ Frame valide trouvée"
                )

                return frame


        time.sleep(0.1)


    print(
        "❌ Impossible de trouver une frame valide"
    )


    return None


# ============================================================
# BOUCLE INSPECTION
# ============================================================

def inspection_loop():

    global inspection_active


    numero = 1


    while inspection_active:

        # ----------------------------------------------------
        # Vérifier production
        # ----------------------------------------------------

        if production is None:

            print(
                "❌ Production absente"
            )

            inspection_active = False

            return


        # ----------------------------------------------------
        # Données
        # ----------------------------------------------------

        PRF = production["PRF"]

        OF = production["OF"]


        # ----------------------------------------------------
        # SN
        # ----------------------------------------------------

        SN = f"SNXXA{numero:05d}"


        print("")
        print("")
        print("======================================")
        print(" NOUVELLE INSPECTION")
        print("======================================")

        print(
            "SN  :",
            SN
        )

        print(
            "PRF :",
            PRF
        )

        print(
            "OF  :",
            OF
        )

        print("======================================")


        # ----------------------------------------------------
        # Temps
        # ----------------------------------------------------

        temps_total = 30


        image_top = None

        image_bottom = None


        # ----------------------------------------------------
        # Inspection
        # ----------------------------------------------------

        for seconde in range(
            temps_total
        ):

            if not inspection_active:

                print(
                    "Inspection arrêtée"
                )

                return


            # ------------------------------------------------
            # Progression
            # ------------------------------------------------

            progress = int(

                (
                    (seconde + 1)
                    /
                    temps_total
                )
                *
                100

            )


            remaining = (

                temps_total
                -
                seconde
                -
                1

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
                        remaining

                }

            )


            # ------------------------------------------------
            # CAPTURE
            # ------------------------------------------------

            if seconde == 15:

                print("")
                print("======================================")
                print(" 📸 CAPTURE INSPECTION")
                print("======================================")


                # --------------------------------------------
                # Attendre frame valide
                # --------------------------------------------

                frame_inspection = (
                    wait_for_valid_frame(5)
                )


                if frame_inspection is None:

                    print(
                        "❌ Aucune frame valide"
                    )


                else:

                    print(
                        "Frame capturée :",
                        frame_inspection.shape
                    )

                    print(
                        "Mean :",
                        frame_inspection.mean()
                    )

                    print(
                        "Max :",
                        frame_inspection.max()
                    )


                    # ----------------------------------------
                    # TOP
                    # ----------------------------------------

                    image_top = (

                        save_inspection_image(

                            frame_inspection,

                            SN,

                            PRF,

                            "TOP"

                        )

                    )


                    # ----------------------------------------
                    # BOTTOM
                    # ----------------------------------------

                    image_bottom = (

                        save_inspection_image(

                            frame_inspection,

                            SN,

                            PRF,

                            "BOTTOM"

                        )

                    )


                print("")

                print(
                    "TOP URL :",
                    image_top
                )

                print(
                    "BOTTOM URL :",
                    image_bottom
                )


            time.sleep(1)


        # ====================================================
        # RESULTAT
        # ====================================================

        resultat, defauts = (

            analyse_carte_aleatoire(

                production[
                    "programme"
                ][
                    "zones"
                ]

            )

        )


        print("")
        print("======================================")
        print(" RESULTAT INSPECTION")
        print("======================================")

        print(
            "Resultat :",
            resultat
        )

        print(
            "Defauts :",
            defauts
        )

        print("======================================")


        # ====================================================
        # JSON
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


        print("")
        print("======================================")
        print(" JSON ENVOYE AU BACKEND")
        print("======================================")

        print(
            inspection
        )

        print("======================================")


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


            print("")
            print(
                "STATUS :",
                response.status_code
            )

            print(
                "RESPONSE :",
                response.text
            )


            if response.status_code in [

                200,
                201

            ]:

                sio.emit(

                    "inspection:saved",

                    {

                        "PRF":
                            PRF

                    }

                )


                print(
                    "✅ INSPECTION ENREGISTREE"
                )


            else:

                print(
                    "❌ ERREUR BACKEND"
                )


        except Exception as e:

            print(
                "❌ Erreur POST :",
                e
            )


        # ====================================================
        # PROCHAINE INSPECTION
        # ====================================================

        numero += 1


        time.sleep(2)


# ============================================================
# DEMARRAGE ROBOT
# ============================================================

print("")
print("======================================")
print(" DEMARRAGE ROBOT SIMULATOR")
print("======================================")
print("")


try:

    # --------------------------------------------------------
    # Laisser caméra démarrer
    # --------------------------------------------------------

    time.sleep(2)


    # --------------------------------------------------------
    # Vérifier frame
    # --------------------------------------------------------

    test_frame = wait_for_valid_frame(5)


    if test_frame is None:

        print("")
        print("⚠️ ATTENTION")
        print(
            "La caméra est ouverte mais aucune "
            "frame valide n'est disponible."
        )

        print(
            "Ferme les autres applications "
            "qui utilisent la webcam."
        )

    else:

        print("")
        print(
            "✅ TEST CAMERA REUSSI"
        )

        print(
            "Taille :",
            test_frame.shape
        )

        print(
            "Luminosité moyenne :",
            test_frame.mean()
        )


    # --------------------------------------------------------
    # Connexion backend
    # --------------------------------------------------------

    print("")
    print(
        "Connexion au backend..."
    )


    sio.connect(
        SERVER_URL
    )


    print(
        "Socket connecté"
    )


    # --------------------------------------------------------
    # Attendre
    # --------------------------------------------------------

    sio.wait()


except KeyboardInterrupt:

    print("")

    print(
        "🛑 Robot arrêté manuellement"
    )


except Exception as e:

    print("")

    print(
        "❌ Erreur robot :",
        e
    )


finally:

    inspection_active = False


    try:

        if camera is not None:

            camera.release()

    except Exception:
        pass


    print(
        "📷 Camera libérée"
    )
