import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
})
export class RobotGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  /**
   * Socket du robot physique / simulateur
   */
  private robot: Socket | null = null;

  // ============================================================
  // CONNEXION
  // ============================================================

  handleConnection(client: Socket) {
    console.log(
      "🟢 Socket connecté :",
      client.id,
    );
  }

  // ============================================================
  // DECONNEXION
  // ============================================================

  handleDisconnect(client: Socket) {
    console.log(
      "🔴 Socket déconnecté :",
      client.id,
    );

    if (this.robot?.id === client.id) {
      this.robot = null;

      console.log(
        "🤖 Robot déconnecté",
      );
    }
  }

  // ============================================================
  // ROBOT CONNECT
  // ============================================================

  @SubscribeMessage("robot:connect")
  handleRobotConnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    console.log("");
    console.log("======================================");
    console.log("🤖 ROBOT CONNECT");
    console.log("======================================");

    console.log(data);

    this.robot = client;

    client.emit(
      "robot:ready",
      {
        robotId:
          data?.robotId,

        message:
          "Robot connecté",
      },
    );

    console.log(
      "✅ Robot enregistré :",
      data?.robotId,
    );
  }

  // ============================================================
  // REJOINDRE INSPECTION
  // ============================================================

  @SubscribeMessage("inspection:join")
  handleInspectionJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() PRF: string,
  ) {
    if (!PRF) {
      console.log(
        "❌ inspection:join sans PRF",
      );

      return;
    }

    const room = String(PRF);

    client.join(room);

    console.log(
      `👁️ Client ${client.id} rejoint la room ${room}`,
    );
  }

  // ============================================================
  // START NOUVELLE INSPECTION
  // ============================================================

  @SubscribeMessage("inspection:start")
  handleInspectionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    console.log("");
    console.log("======================================");
    console.log("▶️ START INSPECTION");
    console.log("======================================");

    console.log(
      "DATA :",
      data,
    );

    const production =
      data?.production;

    const PRF =
      production?.PRF ??
      data?.PRF;

    if (!PRF) {

      console.log(
        "❌ START REFUSÉ : PRF manquant",
      );

      client.emit(
        "inspection:error",
        {
          message:
            "PRF manquant",
        },
      );

      return;
    }

    const room = String(PRF);

    client.join(room);

    // ----------------------------------------------------------
    // ROBOT
    // ----------------------------------------------------------

    if (!this.robot) {

      console.log(
        "❌ START REFUSÉ : robot non connecté",
      );

      client.emit(
        "inspection:error",
        {
          message:
            "Robot non connecté",
        },
      );

      return;
    }

    // ----------------------------------------------------------
    // DONNEES
    // ----------------------------------------------------------

    const startData = {

      ...data,

      production,

      operatorId:
        data?.operatorId ??
        production?.operatorId ??
        null,
    };

    console.log("");
    console.log(
      "📤 ENVOI START AU ROBOT",
    );

    console.log(
      "PRF :",
      PRF,
    );

    console.log(
      "Operator :",
      startData.operatorId,
    );

    this.robot.emit(
      "START",
      startData,
    );

    // ----------------------------------------------------------
    // FRONTEND
    // ----------------------------------------------------------

    this.server
      .to(room)
      .emit(
        "inspection:started",
        {
          PRF,

          message:
            "Inspection démarrée",
        },
      );

    console.log(
      "✅ START envoyé au robot",
    );
  }

  // ============================================================
  // RESUME INSPECTION
  // ============================================================

  @SubscribeMessage("inspection:resume")
  handleInspectionResume(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    console.log("");
    console.log("======================================");
    console.log("▶️ RESUME INSPECTION");
    console.log("======================================");

    console.log(
      "DATA :",
      data,
    );

    const PRF =
      data?.PRF;

    if (!PRF) {

      console.log(
        "❌ RESUME REFUSÉ : PRF manquant",
      );

      client.emit(
        "inspection:error",
        {
          message:
            "PRF manquant",
        },
      );

      return;
    }

    const room = String(PRF);

    client.join(room);

    // ----------------------------------------------------------
    // ROBOT
    // ----------------------------------------------------------

    if (!this.robot) {

      console.log(
        "❌ RESUME REFUSÉ : robot non connecté",
      );

      client.emit(
        "inspection:error",
        {
          message:
            "Robot non connecté",
        },
      );

      return;
    }

    // ----------------------------------------------------------
    // IMPORTANT
    //
    // Le robot possède déjà :
    //
    // production
    // inspection_completed
    // current_sn
    // current_second
    //
    // Donc on ne lui demande PAS de recommencer
    // l'inspection.
    //
    // On lui envoie START.
    //
    // Le Python reconnaît que le PRF est déjà actif
    // et transforme START en RESUME.
    // ----------------------------------------------------------

    console.log(
      "📤 ENVOI START AU ROBOT POUR REPRISE",
    );

    console.log(
      "PRF :",
      PRF,
    );

    this.robot.emit(
      "START",
      {
        PRF,

        production: {
          PRF,
        },

        operatorId:
          data?.operatorId ??
          null,
      },
    );

    console.log(
      "✅ Demande de reprise envoyée au robot",
    );
  }

  // ============================================================
  // PROGRESSION
  // ============================================================

  @SubscribeMessage("inspection:progress")
  handleInspectionProgress(
    @MessageBody() data: any,
  ) {
    if (!data?.PRF) {
      return;
    }

    const room =
      String(data.PRF);

    console.log(
      "📊 PROGRESSION :",
      data.SN,
      `${data.progress}%`,
      "completed =",
      data.completed,
      "remaining =",
      data.remainingSN,
    );

    this.server
      .to(room)
      .emit(
        "inspection:update",
        data,
      );
  }

  // ============================================================
  // CONFIGURATION
  // ============================================================

  @SubscribeMessage("inspection:configuration")
  handleInspectionConfiguration(
    @MessageBody() data: any,
  ) {
    if (!data?.PRF) {
      return;
    }

    const room =
      String(data.PRF);

    this.server
      .to(room)
      .emit(
        "inspection:configuration",
        data,
      );
  }

  // ============================================================
  // INSPECTION SAUVEE
  // ============================================================

  @SubscribeMessage("inspection:saved")
  handleInspectionSaved(
    @MessageBody() data: any,
  ) {
    if (!data?.PRF) {
      return;
    }

    const room =
      String(data.PRF);

    console.log(
      "💾 INSPECTION SAVED :",
      data.SN,
    );

    this.server
      .to(room)
      .emit(
        "inspection:saved",
        data,
      );
  }

  // ============================================================
  // NOUVELLE INSPECTION
  // ============================================================

  @SubscribeMessage("inspection:new")
  handleInspectionNew(
    @MessageBody() data: any,
  ) {
    if (!data?.PRF) {
      return;
    }

    const room =
      String(data.PRF);

    console.log(
      "🆕 NOUVELLE INSPECTION :",
      data.SN,
    );

    this.server
      .to(room)
      .emit(
        "inspection:new",
        data,
      );
  }

  // ============================================================
  // STOP / PAUSE
  // ============================================================

  @SubscribeMessage("inspection:stop")
  handleInspectionStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    console.log("");
    console.log("======================================");
    console.log("🛑 STOP / PAUSE INSPECTION");
    console.log("======================================");

    console.log(data);

    const PRF =
      data?.PRF;

    if (!PRF) {

      console.log(
        "❌ STOP REFUSÉ : PRF manquant",
      );

      client.emit(
        "inspection:error",
        {
          message:
            "PRF manquant",
        },
      );

      return;
    }

    const room =
      String(PRF);

    client.join(room);

    // ----------------------------------------------------------
    // ROBOT
    // ----------------------------------------------------------

    if (this.robot) {

      console.log(
        "📤 Envoi STOP au robot",
      );

      this.robot.emit(
        "STOP",
        {
          PRF,
        },
      );

    } else {

      console.log(
        "⚠️ Robot non connecté",
      );
    }

    // ----------------------------------------------------------
    // FRONTEND
    //
    // Le vrai état STOPPED sera envoyé par le robot.
    // ----------------------------------------------------------

    this.server
      .to(room)
      .emit(
        "inspection:stopping",
        {
          PRF,
        },
      );
  }

  // ============================================================
  // ETAT STOPPED DU ROBOT
  // ============================================================

  @SubscribeMessage("inspection:stopped")
  handleInspectionStopped(
    @MessageBody() data: any,
  ) {
    if (!data?.PRF) {
      return;
    }

    const room =
      String(data.PRF);

    console.log("");
    console.log("======================================");
    console.log("⏸️ INSPECTION EN PAUSE");
    console.log("======================================");

    console.log(data);

    this.server
      .to(room)
      .emit(
        "inspection:stopped",
        data,
      );
  }

  // ============================================================
  // RESUME CONFIRME PAR LE ROBOT
  // ============================================================

  @SubscribeMessage("inspection:resumed")
  handleInspectionResumed(
    @MessageBody() data: any,
  ) {
    if (!data?.PRF) {
      return;
    }

    const room =
      String(data.PRF);

    console.log("");
    console.log("======================================");
    console.log("▶️ INSPECTION REPRISE");
    console.log("======================================");

    console.log(data);

    this.server
      .to(room)
      .emit(
        "inspection:resumed",
        data,
      );
  }

  // ============================================================
  // FIN NORMALE
  // ============================================================

  @SubscribeMessage("inspection:finished")
  handleInspectionFinished(
    @MessageBody() data: any,
  ) {
    if (!data?.PRF) {
      return;
    }

    const room =
      String(data.PRF);

    console.log("");
    console.log("======================================");
    console.log("🏁 INSPECTION FINIE");
    console.log("======================================");

    console.log(data);

    this.server
      .to(room)
      .emit(
        "inspection:finished",
        data,
      );
  }
}