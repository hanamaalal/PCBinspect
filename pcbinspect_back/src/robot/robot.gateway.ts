import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect
} from '@nestjs/websockets';

import {
  Server,
  Socket
} from 'socket.io';

import { InspectionService } from '../inspection/inspection.service';



@WebSocketGateway({

  cors:{
    origin:"http://localhost:3000"
  }

})


export class RobotGateway
implements OnGatewayDisconnect {



constructor(
 private inspectionService:InspectionService
){}



@WebSocketServer()
server:Server;



private robot:Socket|null=null;



// ===============================
// Connexion socket
// ===============================


handleConnection(socket:Socket){

console.log(
"Socket connecté",
socket.id
);

}



handleDisconnect(socket:Socket){


console.log(
"Socket déconnecté",
socket.id
);



if(this.robot?.id===socket.id){

this.robot=null;

}


}




// ===============================
// Robot connecté
// ===============================


@SubscribeMessage("robot:connect")

robotConnect(

client:Socket,

data:any

){


console.log(
"Robot connecté :",
data.robotId
);



this.robot=client;



client.emit(
"robot:ready",
{
message:"Robot prêt"
}
);



}




// ===============================
// Lancement inspection
// ===============================


@SubscribeMessage("inspection:start")

startInspection(

client:Socket,

data:any

){



console.log(
"Demande inspection",
data
);




if(!this.robot){


client.emit(

"inspection:error",

{
message:"Robot non connecté"
}

);


return;

}




const PRF=data.production.PRF;



// opérateur rejoint la salle PRF

client.join(PRF);




// envoyer au robot

this.robot.emit(

"START",

data

);




// confirmer au frontend

client.emit(

"inspection:started",

{
PRF:PRF,
message:"Inspection démarrée"
}

);



console.log(
"START envoyé robot"
);



}




// ===============================
// Progression robot
// ===============================


@SubscribeMessage("inspection:progress")

progress(

client:Socket,

data:any

){



console.log(
"Progression",
data
);



this.server
.to(data.PRF)
.emit(

"inspection:update",

data

);



}




// ===============================
// Inspection sauvegardée
// ===============================


@SubscribeMessage("inspection:saved")


async saved(

client:Socket,

data:any

){



console.log(
"Inspection sauvegardée",
data.PRF
);



const inspections =

await this.inspectionService
.getDernieresInspections(
data.PRF
);



if(inspections.length){



this.server
.to(data.PRF)
.emit(

"inspection:new",

inspections[0]

);


}



}




// ===============================
// Stop
// ===============================


@SubscribeMessage("inspection:stop")


stop(

client:Socket,

data:any

){



console.log(
"STOP",
data
);



if(this.robot){


this.robot.emit(
"STOP"
);


}



this.server
.to(data.PRF)
.emit(

"inspection:stopped",

{
message:"Inspection arrêtée"
}

);



}



}