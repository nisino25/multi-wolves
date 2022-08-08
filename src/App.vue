<template>
<html >
  <head></head>
  <body :style="currentTime == 'day' ? 'background-color: #E0B589;' : 'background-color: #363945; color: white'" >
      <div class="wrapper">
      <div class="container" v-if="readyToPlay">

        <div class="nav" style="margin-bottom: 10px;">
          <strong>Werewolf</strong>
          <br>
          <!-- <span>Possibly {{teamSituation}}</span><br><br> -->
          <span  style="margin-bottom:20px">Day {{detailData.length}}
          <img v-if="currentTime == 'day'"  src="../public/icons/sun.png">
          <img v-if="currentTime == 'night'" style="filter: invert(100%);"  src="../public/icons/moon.png">
          </span>
        </div>
        
        <div class="players row"  >
          <template  v-for="(player,index) in players" :key="index">
            <div class="card"  :style="[!player.alive  ? 'opacity: 0.5 ' : '']" :class="[currentPlayer?.target == player.name ? 'targeted' : '']"  @click="clickingAPlayer(player)">
              <img src="../public/icons/user.png" alt="Avatar">
              <div class="container">

                <!-- name   -->
                <span class="name" :style="myPlayer?.name == player.name ? 'color:blue': ''">{{player.name}}</span>
                <hr>
                <span v-if="myPlayer?.name == player.name" :style="getColor(player.team)">{{player.team}}</span><br>
                <span v-if="myPlayer?.name == player.name">{{player.role}}</span><br>

                <!-- for the seer -->
                <span v-if="currentPlayer?.seerList.includes(player.name)" style="color:red">{{player.role}} <br></span>
                <!-- for the wolves to recognize each othere -->
                <span v-if="currentPlayer?.teams == 'wolves'" style="color:red">{{player.role}} <br></span>
                <!-- <span>{{player.doneWihtNightAction}}</span> -->
                
              </div>
            </div>
            <div v-if="(index+1) % 3==0" cals="line-break">
            
            </div>  
          </template>
 
        </div>

        <div class="controller" v-if="!winner">

          <!-- show log -->
          <template v-if="showingLog">
            <button style="margin-left: 15px;" class="clearButton" @click="deleteLog(); choosingNow = true">Clear Log</button>

            <hr>
            <span v-if="!latestData.isDayOver">This is what happened last night <br><br></span>
            <span v-if="latestData.isDayOver">This is what happened at Voting <br><br></span>

            <template v-for="(item,index) in latestData.officialLog" :key="index">
              <span>{{item}}</span>
              <br>
            </template>
            <span v-if="latestData.officialLog.length ==0">Nothing happened last night</span>
          </template>

          <!-- when not showing log -->
          <template v-if="!showingLog">
            <!-- day time -->
            <!-- buttons -->
              <!-- <button :style="[canMoveForward ? '' : 'opacity: 0.2']" @click="moveToNextState">Forward the Time</button>
               -->

              <button :style="[waitingForOthers ? 'opacity: 0.2' : '']" @click="ready()">Ready</button>

              <template v-if="waitingForOthers">

                <div class="loader"></div>
                <span>Waiting for other players {{liveWaitingList.length}} / {{latestData.players.length}}</span>
              </template>


              <!-- <hr>
              <span v-if="latestData">: {{gameStatus}}</span><br>  -->
              
          </template>
          



          

          <template v-if="currentTime == 'night'">
            <button v-if="unFinishedPlayers.length !== 0 && currentPlayer?.doneWihtNightAction" style="margin-left: 15px" @click="nextToRole()" class="nextButton">Next Role</button>

            <button v-if="unFinishedPlayers.length !== 0 && !currentPlayer?.doneWihtNightAction" style="margin-left: 15px; opacity: 0.2" class="nextButton">Next Role</button>

            <button v-if="currentPlayer?.role == 'seer'" style="margin-left: 15px; " class="actionButton" :style="[currentPlayer?.target ? '' : 'opacity: 0.2']" @click="action()">Check</button>



            

          </template>



          <template v-if="currentTime == 'day' && !showingLog">

            <button v-if="unFinishedPlayers.length !== 0 && currentPlayer?.doneVoting" style="margin-left: 15px" @click="nextToRole()" class="nextButton">Next Role</button>

            <button v-if="unFinishedPlayers.length !== 0 && !currentPlayer?.doneVoting &&currentPlayer" style="margin-left: 15px; opacity: 0.2" class="nextButton">Next Role</button>


            <button v-if="unFinishedPlayers.length !== 0 && !showingLog && currentPlayer " style="margin-left: 15px;" class="skipButton" @click="skipVoting()">Skip</button>
          
          </template>

          <!-- --------------------------------------------- -->

          <div v-if="currentPlayer">
            <template v-if="currentTime == 'night'">
              <small>{{currentPlayer.name}}</small><br>
              <span v-if="!currentPlayer?.doneWihtNightAction">Choose your target</span><br>
              <span v-if="currentPlayer?.doneWihtNightAction">You chose <b style="color:red">{{currentPlayer.target}} </b> as your target</span><br>
              <span v-if="actionWarning" class="warning">{{actionWarning}}</span>
            </template>

            <template v-if="currentTime == 'day' && !showingLog">
              <small>{{currentPlayer.name}}</small><br>
              <span v-if="!currentPlayer?.doneVoting">Choose who you think sus</span><br>
              <span v-if="currentPlayer?.doneVoting">You chose <b style="color:red">{{currentPlayer.target}} </b> for voting</span><br>
              <span v-if="actionWarning" class="warning">{{actionWarning}}</span>
            </template>
          </div>


          <div>

            <hr>
            
            <!-- <button @click="moveToNextState()">Force</button><br> -->
  
            <span>{{this.currentPlayer?.seerList}}</span>
          </div>

        </div>

        <div v-if="winner">
          <h1>{{winner}} won!</h1>
        </div>


      </div>
  
    </div>

    <transition name="fade" >
          <div class='modal-overlay fade-in' v-if="showModal" style="height: 100vh">
            
              <div class="modal" style=" transition : all 0.6s ease 0s;">
                
                
                <div v-if="modalStatus == 1">
                  <form onsubmit="event.preventDefault()">

                    <label>Username</label>
                    <input type="text" placeholder="Type username.." v-model="username" >

                    <span v-if="modalWarning" class="warning">{{modalWarning}}</span>
                    <button @click="signUp()" class="create" >Sign Up</button>
                    <button @click="generateRandomUsername()" class="join" >Random name</button>
                    <!-- OR<br>
                    <button @click="skipToRoles()" class="join">Skip to roles</button>
                    <button @click="defaultCreation()" class="join"  >Default Creation</button> -->

                  </form>
                </div>

                <div v-if="modalStatus == 2">
                  <form onsubmit="event.preventDefault()">
                    <button @click="createARoom()" class="create" >Create a Room</button>
                    OR<br>
                    <label>Room Code</label>
                    <input type="text" placeholder="Type room cocde.." v-model="roomCode" >
                    <button @click="joinARoom()" class="join">Join a Room</button>

                  </form>
                </div>

                <div v-if="modalStatus == 3">
                  <form onsubmit="event.preventDefault()">
                    <span>Currently {{members.length}}/9</span><br>
                      <span>Room Code: <strong style="font-size:175%">{{roomCode}}</strong></span><br>

                      <button v-if="onlineRoll == 'host'" :style="[members.length >= 4 ? '' : 'opacity: 0.2']" @click="closeTheRoom" class="closeButton">Close the Room</button><br>

                      <div v-if="onlineStatus == 'waiting'" class="loader"></div>
                      <template v-for="(player,index) in members" :key="index" style="text-align:left">
                        <span :style="username==player ? 'color:red' : ''">{{index+1}}. {{player}}</span><br>

                      </template>
                      
                      <!-- <hr> -->
                      <!-- <span @click="showModal = false; readyToPlay = true ">{{}}</span> -->
                      <!-- <template v-for="(player,index) in players" :key="index" style="text-align:left">
                        <span :style="username==player ? 'color:red' : ''">{{index+1}}. {{player?.role}}</span><br>

                      </template> -->

                      
                  </form>
                </div>

                <div v-if="modalStatus == 4" style="color:black">
                  <form onsubmit="event.preventDefault()">
                    <span>You "{{myPlayer?.name}}" are playing as <strong style="color:red; font-size:250%"><br>{{myPlayer?.role}}</strong><br> </span>

                    <strong>Team</strong><br>
                    <span>{{rules[myPlayer?.role]?.team}}</span><br><br>

                    <strong>Description</strong><br>
                    <span>{{rules[myPlayer?.role]?.description}}</span><br><br>

                    <strong>Win Condtion</strong><br>
                    <span>{{rules[myPlayer?.role]?.winCondition}}</span><br>

                    <hr>
                    <button @click="showModal = false; readyToPlay = true " class="okButton">OK</button>


                    <!-- <span>Currently {{members.length}}/9</span><br>
                      <span>Room Code: <strong style="font-size:175%">{{roomCode}}</strong></span><br>

                      <button v-if="onlineRoll == 'host'" :style="[members.length >= 4 ? '' : 'opacity: 0.2']" @click="closeTheRoom" class="closeButton">Close the Room</button><br>

                      <div v-if="onlineStatus == 'waiting'" class="loader"></div>
                      <template v-for="(player,index) in members" :key="index" style="text-align:left">
                        <span :style="username==player ? 'color:red' : ''">{{index+1}}. {{player}}</span><br>

                      </template>
                      <hr>
                      <span @click="showModal = false; readyToPlay = true ">heys</span> -->
                      <!-- <template v-for="(player,index) in players" :key="index" style="text-align:left">
                        <span :style="username==player ? 'color:red' : ''">{{index+1}}. {{player?.role}}</span><br>

                      </template> -->

                      <hr>
                      <!-- <span v-if="latestData" style="color:black">{{latestData.waitingList}}</span> -->

                      
                  </form>
                </div>

                


              </div>
          </div>

    </transition>
    
  </body>
</html>
  


</template>

<script>
import {roles} from './const/roles.js'
import {rules} from './const/rules.js'
import db from './firebase.js';

import { copyText } from 'vue3-clipboard'

var randomWords = require('random-words');

export default {
  name: 'App',
  components: {
  },
  data(){
    return{
      readyToPlay: false,
      groupSize: 6,
      players: [],

      showModal: true,
      modalStatus: 1,
      modalWarning: undefined,



      rolesTabs: 0,
      roles,
      rules,

      maxWolvesNum: 2,
      maxSolosNum: 1,
      firstNightKill: false,
      doneWithSoloAssigning:false,




      tempWolves: [],
      tempVillagers: [],
      tempSolos: [],
      actualRoles: {wolves: [], villagers: [], solos: []},
      rolesCount : 0,
      // -----------------------------------
      actionWarning: undefined,
      showingLog: false,
      target: undefined,

      detailData:[],
      winner: undefined,

      currentPlayer: undefined,
      choosingNow: false,
      generalMessage: undefined,
      generalCounter: undefined,

      // -----------------------------------
      skipTheFirstStep: true,
      skipFlag: true,
      username: undefined,
      onlineRoll: undefined,
      onlineStatus: undefined,
      roomCode: '',
      gameStatus: 'waiting',

      members: [],
      waitingList: [],
      // waitingForOthers: false,

      turnCount: 0,


    }
  },
  methods:{

    // setup ------------------------------
    // createARoom(){

    //   // check if the number is correct
    //   if(this.groupSize >= 10 || this.groupSize < 3) {
    //     this.modalWarning = 'Cannot have the number '
    //     return 
    //   }
      

    //   let count =0
    //   while(count < this.groupSize){
    //     this.players.push({name: `player${count+1}`, alive: true,role: undefined,team: undefined,target: undefined, dayVotingTarget: undefined, doneVoting: true,targetedBy: 0, seerList: [], doneWihtNightAction: true})
    //     count++
    //   }
      
      
    //   this.modalStatus++
    //   // console.log(this.players)

    // },
    doneWithNames(){
      
      for(let i in this.players){
        let player = this.players[i]

        // checking if the empty value exists or not
        if(player.name == ''){
          this.modalWarning = 'Name cannot be empty'
          return 
        }
        
        if(player.name == 'skipping'){
          this.modalWarning = 'Name cannot be skipping'
          return 
        }

        // checking if the name is not duplicage
        for(let c in this.players){
          if(player.name == this.players[c].name && i !== c){
          // console.log(`${i}: ${c}`)
          this.modalWarning = 'Cannot have the same name'
          return 
        } 
        }
      }

      // console.log(this.players)
      this.modalStatus++
    },
    doneWithRoles(){
      // if(this.firstNightKill) console.log('yes')
      // if(!this.firstNightKill) console.log('off')
      // console.log(`first kill? ${this.firstNightKill}`)
      
      // considert the team balance
      if(!this.continueFlag) return
      if(this.modalWarning) return


      // think about the portion of the wolf team
      



      // assign the roles in backgeound
      this.assignRoles()
      this.copyTheDetail()
      this.showModal = false

      this.readyToPlay = true
      

    },
    assignRoles(){
      if(this.players.length < 5){
        this.maxWolvesNum = 1
      }
      // console.log('------------------------starting up')
      // console.log(this.teamSituation)
      // just werewolf is not possible
      // just villager is not possible

      // just solos
      // if(this.teamSituation == 'just solos'){
      //   for(let i in this.players){
      //     let player = this.players[i]
      //     player.team = 'solos'
      //     player.role =  this.getRandomRole(player.team)
      //     this.rolesCount++
      //   }
      //   return 
      // }

      // -----------------------------------------------------------------------------------------

      // wolves, villager
      if(this.teamSituation == 'wolves and villagers'){
        // console.loeg('no preoblem until here')
        
        // make 2 teams
        this.getTwoTeams()
        


        // assign the roles to the rest of the team
        while(this.notAssignedPlayers.length !== 0){
          
          let randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
          let theName = this.notAssignedPlayers[randomNum]
          let player = this.players.find(o => o.name === theName) 

          // if you cannot put more wolves, just add villager
          
          if(this.doneWithWolvesAssigning()){

            player.team = 'villagers' 
            player.role = this.getRandomRole('villagers')
             

          }else{
            if(this.wolvesOrNot()){
              player.team = 'wolves' 
              player.role = this.getRandomRole('wolves')
            }else{
              player.team = 'villagers' 
              player.role = this.getRandomRole('villagers')
            }
          }
        }
        return 
      }

      // // every team
      if(this.teamSituation == 'every team'){
        // console.log('here right ?')
        // console.loeg('no preoblem until here')
        
        // make 2 teams
        this.getTwoTeams()

        // get one none vilalger
        


        // assign the roles to the rest of the team
        while(this.notAssignedPlayers.length !== 0){
          
          let randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
          let theName = this.notAssignedPlayers[randomNum]
          let player = this.players.find(o => o.name === theName) 

          // if you cannot put more wolves, just add villager
          
          if(this.doneWithWolvesAssigning()){

            if(this.doneWithSoloAssigning){
              player.team = 'villagers' 
              player.role = this.getRandomRole('villagers')
            }else{

              this.generalCounter = this.roles.villagers.length + this.roles.solos.length 
              let d = Math.random();
              if (d < (this.roles.villagers.length +1.3)/ this.generalCounter){
                // console.log( (this.roles.villagers.length +1.5) / this.generalCounter)
                player.team = 'villagers' 
                player.role = this.getRandomRole('villagers')
              }else{
                // console.log('wovles')
                player.team = 'solos' 
                player.role = this.getRandomRole('solos')
                this.doneWithSoloAssigning = true
              }
            }

          }else{
            // console.log('here')
            if(this.wolvesOrNot()){
              player.team = 'wolves' 
              player.role = this.getRandomRole('wolves')
            }else{
              // villagers or solo 
              if(this.doneWithSoloAssigning){
                player.team = 'villagers' 
                player.role = this.getRandomRole('villagers')
              }else{
                this.generalCounter = this.roles.villagers.length + this.roles.solos.length 
                let d = Math.random();
                if (d < (this.roles.villagers.length +1.3)/ this.generalCounter){
                  // console.log( (this.roles.villagers.length +1.5) / this.generalCounter)
                  player.team = 'villagers' 
                  player.role = this.getRandomRole('villagers')
                  
                }else{
                  // console.log('wovles')
                  player.team = 'solos' 
                  player.role = this.getRandomRole('solos')
                  this.doneWithSoloAssigning = true
                }
              }
              
              

              
            // console.log(player.role)
            }
          }
        }
        return 
      }
      // return false
      
    },
    doneWithWolvesAssigning(){
      let count = 0
      for(let i in this.players){
        let player = this.players[i]
        if(player.team == 'wolves') count++
      }

      if(count >= this.maxWolvesNum){
        return true
      }else{
        return false
      }
    },
    copyTheDetail(){ 
      for(let i in this.players){
        let player = this.players[i]
        if(player.role == 'villager' || player.role == 'fool' ){
          player.canMoveAtNight= false
          // player.doneWihtNightAction= true
        }else{
          player.canMoveAtNight= true
        }
      }
    },


    wolvesOrNot(){
      var d = Math.random();
      if (d < 0.7){
        // console.log('human')
        return false
      }else{
        // console.log('wovles')
        return true
      }
          // 3
    },
    getTwoTeams(){

      let randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
      let theName = this.notAssignedPlayers[randomNum]
      let player = this.players.find(o => o.name === theName)

      switch(this.teamSituation){
        case 'wolves and villagers':
          player.team = 'wolves'
          player.role =  this.getRandomRole('wolves')

          randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
          theName = this.notAssignedPlayers[randomNum]
          player = this.players.find(o => o.name === theName)
          player.team = 'villagers'
          player.role = this.getRandomRole('villagers')

          break;

        case 'every team':
          // console.log('here')
          player.team = 'wolves'
          player.role =  this.getRandomRole('wolves')

          randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
          theName = this.notAssignedPlayers[randomNum]
          player = this.players.find(o => o.name === theName)
          player.team = 'villagers'
          player.role = this.getRandomRole('villagers')
          break;

      }
      // console.log(`${player.name}: ${player.role}-----------------`)

      // randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
      // theName = this.notAssignedPlayers[randomNum]
      // player = this.players.find(o => o.name === theName)
      // player.team = 'villagers'
      // player.role = this.getRandomRole('villagers')
      // console.log(`${player.name}: ${player.role}-----------------`)
      // console.log('done with setup')


    },
    getRandomRole(team){
      // console.log(this.tempSolos)
      // let role
      let list = []
      // console.log('assigning')
      switch(team){
        
        case 'wolves':
          for(let i in this.roles.wolves){
            let role = this.roles.wolves[i]
            if(role.assigned) list.push(role.name)
          }
          return list[Math.floor(Math.random()* list.length)]; 

        case 'villagers':
          for(let i in this.roles.villagers){
            let role = this.roles.villagers[i]
            if(role.assigned) list.push(role.name)
          }
          return list[Math.floor(Math.random()* list.length)]; 

        case 'solos':
          for(let i in this.roles.solos){
            let role = this.roles.solos[i]
            if(role.assigned) list.push(role.name)
          }
          return list[Math.floor(Math.random()* list.length)]; 
        
      }
      
    },
    getRandomValue(list){
      console.log('function here')
      return list[Math.floor(Math.random()* list.length)]; 
    },



    // game controlling ----------------------------------------------------------
    clickingAPlayer(target){
      
      // if(!this.choosingNow) return
      if(!this.currentPlayer) return
      if(this.currentTime == 'night' && this.currentPlayer.doneWihtNightAction) return

      this.actionWarning = undefined
      // most likely cannot pick yourself right?
      if(this.currentPlayer.name == target.name){
        this.actionWarning = 'Cannot choose yourself'
        this.currentPlayer.target = undefined
        this.currentPlayer.doneWihtNightAction = false
        this.currentPlayer.doneVoting = false
        return
      }

      if(this.currentTime == 'night'){
        // if(this.currentPlayer.doneWihtNightAction) return
        if(this.currentPlayer.team == 'wolves'){
          if(target.team == 'wolves'){
            this.actionWarning = 'Cannot choose the same team'
            this.currentPlayer.target = undefined
            this.currentPlayer.doneWihtNightAction = false
            return 
          }
          if(!target.alive){
            
            this.actionWarning = 'Cannot choose the dead'
            this.currentPlayer.target = undefined
            this.currentPlayer.doneWihtNightAction = false
            return 
          } 
          this.currentPlayer.target = target.name
          console.log(target.name)
          this.currentPlayer.doneWihtNightAction = true
          return
        }

        if(this.currentPlayer.team == 'villagers'){
          if(this.currentPlayer.doneWihtNightAction) return

          if(!target.alive){
            this.actionWarning = 'Cannot choose the dead'
            this.currentPlayer.target = undefined
            this.currentPlayer.doneWihtNightAction = false
            return 
          } 
          this.currentPlayer.target = target.name
          // this.currentPlayer.doneWihtNightAction = true
          return
        }

        

      }

      if(this.currentTime == 'day'){
        if(!target.alive){
          this.actionWarning = 'Cannot choose the dead'
          this.currentPlayer.target = undefined
          this.currentPlayer.doneVoting = false
          return 
        } 
        this.currentPlayer.target = target.name
        this.currentPlayer.doneVoting = true
        return

      }
    },
    skipVoting(){
      this.actionWarning = undefined

      if(this.currentTime == 'day'){
        this.currentPlayer.target = 'skipping'
        this.currentPlayer.doneVoting = true
        return
      }
    },
    moveToNextState(){
      if(!this.canMoveForward) return

      // case 1 the very first time when changed to night
      if(this.detailData.length == 0){
        console.log('sending data')
        const ref = db.collection('werewolf')
        // this.waitingList = JSON.parse(doc.db().waitingList)
        if(!this.waitingList.includes(this.username)) this.waitingList.push(this.username)
        ref.doc(`${this.roomCode}`).update({
          waitingList: JSON.stringify(this.waitingList)
        })




        // this.detailData.push( {nightLog: [], dayLog: [], isNightOver: false, isDayOver: false, officialLog: [], })

        // // this.getTheCurrentPlayer()

        // for(let i in this.players){
        //   let player = this.players[i]
        //   if(player.alive && player.canMoveAtNight){
        //     player.doneWihtNightAction = true
        //     if(player.team !== 'wolves' ) player.doneWihtNightAction = false
        //     player.target = undefined
        //   }
        // }


        // this.latestData.officialLog.push(`People cannot be killed at the first night`)
        // this.showingLog = true
        // this.getTheCurrentPlayer()
        return
      }
      // case 1.5 when the very first night is over
      if(!this.latestData.isNightOver && this.detailData.length == 1){ 
        // this.choosingNow = false
        this.showingLog = true
        this.latestData.isNightOver = true
        // this.clearTargetAndCounting()
        this.clearVote()
        this.getTheCurrentPlayer()
        this.choosingNow = true
        
        return
      }

      // case 2 when the night is over
      if(!this.latestData.isNightOver){
        console.log('here 2')

         
        this.choosingNow = false
        this.showingLog = true
        this.getTheResult()
        // this.clearTargetAndCounting()
        
        // console.log(this.players)
        this.latestData.isNightOver = true
        this.clearVote()
        this.getTheCurrentPlayer()
        
        return
      }

      // case 3 when the day is over and but before voting
      if(this.latestData.isNightOver && !this.latestData.isDayOver){
        console.log('here 3')
        
        this.currentPlayer = undefined
        // show the voting display
        // do the killing and protection action  
        let theTarget = this.getVillagerVotingResult() 
        this.villagerKillingAction(theTarget)



        this.latestData.isDayOver = true
        this.clearAllTargets()
        // console.log('please get here')
        return 
        
      }

      // case 4 after voting
      if(this.latestData.isNightOver && this.latestData.isDayOver){
        console.log('here 4')
        this.clearTargetAndCounting()
        this.showingLog = false

        this.detailData.push( {nightLog: [], dayLog: [], isNightOver: false, isDayOver: false,officialLog: [], })
        this.nightActions()
      }


    },

    nextToRole(){
      this.currentPlayer =  this.players.find(o => o.name === this.unFinishedPlayers[0]) 
    },

    nightActions(){
      console.log('function here')

      // wolves voting one by one

      
      // console.log('getting to wolves')
      let player = this.players.find(o => o.name === this.unFinishedPlayers[0]) 
      this.currentPlayer = player
      this.choosingNow = true


      




    },

    getTheResult(){
      console.log('function here')

      this.currentPlayer= undefined

      // wolves choosing the target as a team

      let theTarget = this.getWolvesVotingResult('wolves')

      if(theTarget) this.latestData.nightLog.push(`Team wolves chose ${theTarget.name} as their target`)

      // if not get the most voted or random

      // do the killing if there is nobody protecting them
      if(theTarget){
        this.latestData.nightLog.push(`Team wolves kiiled ${theTarget.name} succesfully`)
        this.latestData.officialLog.push(`${theTarget.name} was killed`)
        theTarget.alive = false 
      }

      // do the killing for the solios

      // judge if the game is over ------------------
      this.clearAllTargets()
      this.judgeTheWinner()
      

    },

    villagerKillingAction(theTarget){
      console.log('function here')
      
      if(theTarget) this.latestData.nightLog.push(`Villagers chose ${theTarget.name} as their target from voting`)

      // if not get the most voted or random

      // do the killing if there is nobody protecting them
      
      if(theTarget){
        this.latestData.nightLog.push(`Villagers voted and killed ${theTarget.name} succesfully`)
        
        // this.latestData.officialLog.push(`${theTarget.name} was killed`)
        theTarget.alive = false 

        if(theTarget.role == 'fool'){
          this.winner = `${theTarget.name} as a fool`
        }
        this.showingLog = true
      }

      // if(!theTarget){
      // }

      // do the killing for the solios

      // judge if the game is over ------------------
      this.judgeTheWinner()
    },

    getWolvesVotingResult(who){
      console.log('function here')
      this.clearCount()
      // this.clearTargetAndCounting()
      if(this.detailData.length == 1) return false
      
      // get the list
      let list = []
      let theTarget = undefined

      // if requested by wolves
      if(who == 'wolves'){
        for(let i in this.players){
          let player = this.players[i]
          if(player.team  == 'wolves' && player.alive) {
            let target = this.players.find(o => o.name === player.target) 
            // console.log(target)
            target.targetedBy++
          }
        }
  
        let max = 1
        this.generalCounter= 0
        for(let c in this.players){
          
          let player = this.players[c]
          if(player.targetedBy == max){
            list.push(player.name)
            this.generalCounter++
          }else if(player.targetedBy > max){
            this.generalCounter++
            max = player.targetedBy

            list = []
            list.push(player.name)
          }
        }
      }

      console.log(list)

      // ------------------------------------------------------------

      

      // if they choose only one person
      if(list.length == 1){
        theTarget = this.players.find(o => o.name === list[0]) 
        this.generalMessage = `${who} chose ${theTarget.name} unanimously`
          
  
        console.log(this.generalMessage) 
        this.latestData.nightLog.push(this.generalMessage)
        
        return theTarget
      }else if(list.length> 1){
        if(who == 'wolves'){
          // pick randomly
          let theName = this.getRandomValue(list)
          theTarget = this.players.find(o => o.name === theName) 
          this.generalMessage = `${who}'s voting was splited so picked ${theTarget.name} randomly`
          console.log(this.generalMessage) 
          this.latestData.nightLog.push(this.generalMessage)
          return theTarget
        }
      }

    },
    getVillagerVotingResult(){
      console.log('function here')
      // get the list
      this.clearCount()
      // this.clearTargetAndCounting()
      let list = []
      let theTarget = undefined

      for(let i in this.players){
        let player = this.players[i]
        if(player.alive && player.target !== 'skipping'){

          let target = this.players.find(o => o.name === player.target) 
          target.targetedBy++
        }
      }
      
      let max = 1
      this.generalCounter= 0
      for(let c in this.players){
        
        let player = this.players[c]
        if(player.targetedBy == max){
          list.push(player.name)
          this.generalCounter++
        }else if(player.targetedBy > max){
          this.generalCounter++
          max = player.targetedBy

          list = []
          list.push(player.name)
        }
      }

      // -------------------------------------------------------------
      // if they choose no body

      if(list.length == 0){
        console.log('reached here')
        this.generalMessage = `Everyone didn't vote so nobody died`
        // console.log(this.generalMessage) 
        this.latestData.nightLog.push(this.generalMessage)
        this.latestData.officialLog = []
        this.latestData.officialLog.push(this.generalMessage)
        this.showingLog = true
        return false
      } 

      // if they choose only one person
      if(list.length == 1){
        theTarget = this.players.find(o => o.name === list[0]) 
        this.generalMessage = `Villagers chose ${theTarget.name} to kill`
          

        console.log(this.generalMessage)
        this.latestData.officialLog = [] 
        this.latestData.nightLog.push(this.generalMessage)
        this.latestData.officialLog = []
        // this.latestData.officialLog.push(`Villagers voted and killed ${theTarget.name} succesfully`)
        this.latestData.officialLog.push(this.generalMessage)
        
        return theTarget
      }else if(list.length> 1){
          // pick no one
          this.generalMessage = `Villager's voting was splited and couldn't decide`
          console.log(this.generalMessage) 
          this.latestData.officialLog = []
          this.latestData.officialLog.push(this.generalMessage)
          this.latestData.nightLog.push(this.generalMessage)
          this.showingLog= true
          return false
      }

    },

    clearTargetAndCounting(){
      console.log('function here')
      for(let i in this.players){
        let player = this.players[i]
        if(player.alive){
          // player.target = undefined
          player.targetedBy = 0
          
          player.doneWihtNightAction= false
          if(this.currentTime == 'night') player.doneVoting  = false
        }
      }
    },

    clearAllTargets(){
      console.log('function here')
      for(let i in this.players){
        let player = this.players[i]
        if(player.alive){
          player.target = undefined
        }
      }
    },

    getTheCurrentPlayer(){

      this.currentPlayer = this.players.find(o => o.name === this.unFinishedPlayers[0]) 
    },

    judgeTheWinner(){
      let wolvesCount = 0
      let villagersCount = 0
      // let solosCount = 0
      // let theSurvivor = undefined

      for(let i in this.players){
        let player = this.players[i]
        if(player.alive){
          if(player.team == 'wolves'){
            wolvesCount++
          }else if(player.team == 'villagers'){
            villagersCount++
          }else if(player.team == 'solos'){
            // theSurvivor = player.name
            // solosCount++
          }

        }

      }

      // if()
      // for now it just solo is just fool so


      if(wolvesCount == 0) this.winner = 'villagers'
      if(villagersCount == 0) this.winner = 'wolves'

      

      //   // if(villagersCount == 0){
      //   //   this.winner = 'solos'
      //   // }else if(solosCount == 0){
      //   //   this.winner = 'villagers'
      //   // }
      // }else if(villagersCount == 0 && solosCount == 0){
      //   this.winner = 'wolves'
      //   // this.latestData.officialLog.push(`${this.winnner} is the winner`)

      // }else if(wolvesCount == 0 && solosCount == 0){
      //   this.winner = 'villagers'
        
      // }
    },





    // -----------------------------------
    deleteLog(){
      this.latestData.officialLog = []
      this.showingLog = false
    },

    clearVote(){
      for(let i in this.players){
        let player = this.players[i]
        player.target = undefined
        player.doneVoting = false

      }
    },

    clearCount(){
      for(let i in this.players){
        let player = this.players[i]
        player.targetedBy = 0
      }
    },

    action(){
      let player = this.currentPlayer 
      if(!player.target) return false
      if(player.doneWihtNightAction) return false

      let target = this.players.find(o => o.name === player.target) 
      let role = player.role
      player.doneWihtNightAction = true
      if(role == 'seer'){
        player.seerList.push(target.name)
      } 
      console.log(`${target.name} is: ${target.role}`)
    },



    // styles ------------------------------------------------
    getColor(team){
      switch(team){
        case 'wolves':
          return 'color: red'

        case 'solos':
          return 'color:green'
      }
    },

    // controlling the game easily----------------------------------------
    defaultCreation(){
      if(this.readyToPlay) return
      this.createARoom()
      this.doneWithNames()
      this.doneWithRoles()
    },
    skipToRoles(){
      this.createARoom()
      this.doneWithNames()
    },

    test(){
      
      if(!this.skipTheFirstStep) return
      this.username = randomWords(); 
      this.modalStatus++
    },





    // setingup online ---------------------------------------
    signUp(){
      if(this.username == ''){
        this.modalWarning = 'Name cannot be empty'
        return 
      }
      
      if(this.username == 'skipping'){
        this.modalWarning = 'Name cannot be skipping'
        return 
      }

      this.modalStatus++
    },
    generateRandomUsername(){
      this.username =randomWords();
    },

    createARoom(){
      this.warning = undefined
      let result = this.generateRoomCode()
      this.skipFlag = false
      

      let r= confirm(`Are you ready to create a room "${result}"?`);
      if(!r){
        // this.movingRobber = false;
        return;
      }

      

      this.members.push(this.username)
      this.onlineRoll = 'host'
      localStorage.userName = this.userName

      // console.log('sending data')
      const ref = db.collection('werewolf')
      ref.doc(`${result}`).set({
        // TotalNum: this.userNum 
        hostName: this.username,
        gameStatus: 'waiting',
        members: JSON.stringify([this.username]),
        detailData: JSON.stringify([{waitingList: [], players: [], gameStatus: 'waiting'}]),

        // this.detailData.push( {nightLog: [], dayLog: [], isNightOver: false, isDayOver: false, officialLog: [], })

        // // this.getTheCurrentPlayer()

        // for(let i in this.players){
        //   let player = this.players[i]
        //   if(player.alive && player.canMoveAtNight){
        //     player.doneWihtNightAction = true
        //     if(player.team !== 'wolves' ) player.doneWihtNightAction = false
        //     player.target = undefined
        //   }
        // }

      })
      this.roomCode = result
      this.modalStatus++
      this.onlineStatus = 'waiting'

      // navigator.clipboard.writeText(this.roomCode);
      // document.execCommand(this.roomCode);

      copyText(`${this.roomCode}`)
      this.ReciveTheData()


    },

    joinARoom(){
      console.log('trying to join ' + this.roomCode )

      var docRef = db.collection('werewolf').doc(`${this.roomCode}`);

      docRef.get().then((doc) => {
          if (doc.exists) {
            this.members = JSON.parse(doc.data().members)
            if(!this.members.includes(this.username)) this.members.push(this.username)
            this.modalStatus = 3
            this.onlineRoll = 'guest'

            docRef.update({
              members: JSON.stringify(this.members),
            })
            // this.countingToStartGame()

            this.onlineStatus = 'waiting'
            this.ReciveTheData()
            return
          } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
          }
      }).catch((error) => {
          console.log("Error getting document:", error);
      });


  
      // const ref = db.collection('werewolf').doc(`${this.roomCode}`)
      // ref.get()
      //   .then((docSnapshot) => {
      //     if (docSnapshot.exists) {
      //       console.log('it exsits')
      //       // if(this.onlineStatus == 'playing') 
      //       // console.log('jeus')
      //       // console.log('yaas')
      //       // this.warning = undefined
      //       ref.onSnapshot((doc) => {
      //         // console.log(doc.data())
              
      //         // this.playingInARoom = true
      //         // console.log(';sup')
      //         this.members = JSON.parse(doc.data().members)
      //         if(!this.members.includes(this.username)) this.members.push(this.username)
      //         this.modalStatus = 3
      //         // this.onlineStatus= 'waiting'

      //         // this.isMixedOver = true
      //         // this.shuffledIndex = JSON.parse(doc.data().shuffle)
      //         // this.tempDeck = JSON.parse(doc.data().deck)

      //         ref.update({
      //           members: JSON.stringify(this.members),
      //         })
      //         // this.countingToStartGame()

      //         this.onlineStatus = 'waiting'
      //         this.ReciveTheData()
      //         return
              
      //       });
      //     } else {
      //       this.modalWarning = `"${this.roomCode}" does not exist`
      //       console.log('not exisiting')
      //     }
      // });

      this.onlineRoll = 'guest'

    },

    closeTheRoom(){
      if(this.members.length <4) return


      
      // assigining roles as host
      this.multiAssignRoles()

      // sending the data for the first time
      this.detailData =[{nightLog: [], dayLog: [], isNightOver: false, isDayOver: false, officialLog: [],players: this.players, waitingList:[],gameStatus: 'ready',}]
      const ref = db.collection('werewolf')
      ref.doc(`${this.roomCode}`).update({
        // TotalNum: this.userNum 
        // hostName: this.username,
        gameStatus: 'ready',
        // players: JSON.stringify(this.players),
        // waitingList: JSON.stringify([]),
        detailData: JSON.stringify( this.detailData)
        // members: JSON.stringify([this.username]),

      })
    },

    generateRoomCode(){
      var randomChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
			var result = '';
      var char = null;
			for ( var i = 0; i < 5; i++ ) {

        char = randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        if(char === 'l' || char === 'I' || char === 'o'  || char === 'O' || char === '0'){
          // since it is really hard to distinguishj I and l
          // console.log(`I hate ${char} || ${i}`) 
          i--;
        }else{
					result += char
        }
			}
      return result
    },

    ReciveTheData(){
      

      db.collection("werewolf").doc(`${this.roomCode}`)
      .onSnapshot((doc) => {
        

        if(this.onlineStatus == 'waiting'){
          // console.log('new data incoming ------------')
          // console.log(doc.data().members)
          this.members = JSON.parse( doc.data()?.members)
          if(doc.data().gameStatus == 'ready'){
            console.log('ready to go')
            this.gameStatus = 'ready'
            this.onlineStatus = 'ready'
            this.modalStatus++

            this.detailData = JSON.parse(doc.data().detailData)
            this.players = this.latestData.players
            this.waitingList = this.latestData.waitingList
            
          }
          

        }else if(this.onlineStatus == 'ready'){
          console.log('new data incoming ------------')
         
          this.detailData= JSON.parse(doc.data().detailData)
          this.players = this.latestData.players

          this.gameStatus = this.latestData.gameStatus
          
          if(this.onlineRoll == 'host'){
            // very first time
            if(this.liveWaitingList.length == this.players.length){
              if(this.turnCount == 0){
                console.log('advancing to the first night')
                this.turnCount++

                // this.detailData[0].gameStatus = 'playing'
                this.latestData.gameStatus = 'playing'

                // add the job for the seer not wolves for the first time
                this.toggleWaitingList()
                // this.latestData.waitingList = []

                const ref = db.collection('werewolf')
                ref.doc(`${this.roomCode}`).update({
                  // gameStatus: 'playing',
                  detailData: JSON.stringify(this.detailData)
                })
              }else if(this.turnCount == 1){
                console.log('advancing to the first day')
                this.turnCount++


                // toggle for voting
                this.toggleWaitingList() 
                
              }

              // do the things to advance it
            }
          }
        }
          return 
      }

      
      )


        
    },

    multiAssignRoles(){
      let count = 0
      while(count < this.members.length){
        this.players.push({name: this.members[count], alive: true,role: undefined,team: undefined,target: undefined, dayVotingTarget: undefined, doneVoting: true,targetedBy: 0, seerList: [], doneWihtNightAction: true})
        count++
      }

      console.log(this.players)


      this.assignRoles()

      
    },

    ready(){
      if(this.waitingForOthers) return

      if(this.latestData.waitingList.includes(this.username)) return 

      this.latestData.waitingList.push(this.username)


      const ref = db.collection('werewolf')
      ref.doc(`${this.roomCode}`).update({
        detailData: JSON.stringify( this.detailData)
        // members: JSON.stringify([this.username]),

      })

      console.log('adding my data')
    },

    toggleWaitingList(){
      // first time when it changed
      let list = []
      if(this.detailData?.length ==1 && this.gameStatus == 'ready'){
        console.log('first time toggling ')
        for(let i in this.players){
          let player = this.players[i]
          if(player.role !== 'seer'){
            
            list.push(player.name)
          }
        }

        this.latestData.waitingList = list

        // update: detailData with waiting list
      }
    },




    

    
  },
  watch:{
    modalStatus(){
      this.modalWarning = undefined
    },
    actualRoles(){
      this.modalWarning = undefined
    },
    tempWolves(){
      console.log(this.tempWolves)
    },

    maxWolvesNum(){
      if(this.modalStatus !== 3) return
      if(( this.maxWolvesNum >= (this.players.length * 0.5) ) || this.maxWolvesNum < 1){
        this.modalWarning = 'Wolve number cannot be that high'
      }else{
        this.modalWarning = undefined
      }
    },
    winner(){
      this.latestData.officialLog.push(`${this.winner} is the winner`)
      alert(`${this.winner} just won`)
    },
    latestIndex(){
      // localStorage.werewolfGameData = JSON.stringify(this.latestData.nightLog)
    },

    // ------------------------------
    username(){
      localStorage.username = this.username
    },

    // liveWaitingList(){
    //   if(this.liveWaitingList?.includes(this.username)){
    //     return this.waitingForOthers = true
    //   }else{
    //     return this.waitingForOthers = false
    //   }

    // },
    // waitingList(){
    //   if(this.waitingList?.length <this.members.length){
    //     this.waitingForOthers = false
    //   }else{
    //     this.waitingForOthers = true
    //   }
      
    //   // console.log(this.waitingList)
    // },

    // ------------------------------
    roomCode(){
      if(!this.skipFlag) return
      if(this.roomCode.length == 5){
        this.joinARoom()
      }
    }

  },
  computed:{
    tempRolesList(){
      switch(this.rolesTabs) {
        case 0:  // if (x === 'value1')
          return this.roles.wolves

        case 1:  // if (x === 'value2')
          return this.roles.villagers

        case 2:  // if (x === 'value2')
          return this.roles.solos
          
        default:
          return false
      }
    },
    tempList(){
      switch(this.rolesTabs) {
        case 0:  // if (x === 'value1')
          return this.tempWolves

        case 1:  // if (x === 'value2')
          return this.tempVillagers

        case 2:  // if (x === 'value2')
          return this.tempSolos
          
        default:
          return false
      }
    },
    tempCount(){
      let list = {}

      let count  =0
      for(let i in this.roles.wolves){
        let player = this.roles.wolves[i]
        if(player.assigned) count++
      }

      // list.push(count)
      list.wolves = count

      count = 0
      for(let i in this.roles.villagers){
        let player = this.roles.villagers[i]
        if(player.assigned) count++
      }
      // list.push(count)
      list.villagers = count

      count = 0
      for(let i in this.roles.solos){
        let player = this.roles.solos[i]
        if(player.assigned) count++
      }
      // list.push(count)
      list.solos = count


      return list


    },
    continueFlag(){
      if(this.tempCount.wolves == 0){
        if(this.tempCount.solos == 0){
          return false
        }else{
          // this.teamsSituation = ''
          return true
        }
      }

      if(this.tempCount.villagers == 0){
        if(this.tempCount.solos == 0){
          return false
        }else{
          return true
        }
      }



      return true

    },
    teamSituation(){
      // just werewolf is not possible
      // just villager is not possible

      // just solos
      if(this.tempCount.wolves == 0 && this.tempCount.villagers == 0){
        return 'just solos'
      }

      // -----------------------------------

      // wolves, villager
      if(this.tempCount.wolves > 0 && this.tempCount.villagers > 0 && this.tempCount.solos == 0){
        return 'wolves and villagers'
      }

      // wolves, solos
      if(this.tempCount.wolves > 0 && this.tempCount.villagers == 0 && this.tempCount.solos >0){
        return 'wolves and solos'
      }

      // villagers, solos
      if(this.tempCount.wolves == 0 && this.tempCount.villagers > 0 && this.tempCount.solos >0){
        return 'villagers and solos'
      }

      // -----------------------------------


      // with everyone
      if(this.tempCount.wolves > 0 && this.tempCount.villagers > 0 && this.tempCount.solos >0){
        return 'every team'
      }

      return false
      

      
    }, 
    tempAssigned(){
      let list = {}
      let roleList = []
      for(let i in this.roles.wolves){
        let role = this.roles.wolves[i]
        if(role.assigned) roleList.push(role.name)
      }
      list.push(roleList)
      roleList = []

      for(let i in this.roles.villagers){
        let role = this.roles.villagers[i]
        if(role.assigned) roleList.push(role.name)
      }
      list.push(roleList)
      roleList = []

      for(let i in this.roles.solos){
        let role = this.roles.solos[i]
        if(role.assigned) roleList.push(role.name)
      }
      list.push(roleList)
      return list
    },
    notAssignedPlayers(){
      let list = []
      for(let i in this.players){
        let player = this.players[i]
        if(!player.role) list.push(player.name)
      }
      return list
    },

    currentTime(){
      if(this.detailData ==0){
        return 'day'
      }

      if(this.detailData?.length ==1 && this.gameStatus == 'ready'  ){
        return 'day'
      }

      if(!this.latestData.isNightOver){
        return `night`
      }else{
        return `day`
      }

      // return false

    },

    

    latestData(){
      return this.detailData.slice(-1)[0]
    },
    liveWaitingList(){
      return this.latestData?.waitingList
    },

    
    myPlayer(){
      // return this.players.find(o => o.name === this.username) 
      return this.latestData.players.find(o => o.name === this.username)
    },

    myRole(){
      let player =  this.players.find(o => o.name === this.username) 
      return player.role
    },

    waitingForOthers(){
      if(this.liveWaitingList?.includes(this.username)){
        return true
      }else{
        return false
      }
    },


    // ------------------------------
    canMoveForward(){
      if(this.winner) return false
      if(this.currentTime == 'day'){
        if(this.showingLog) return true

        for(let i in this.players){
          let player = this.players[i]
          if(player.alive){

            if(!player.doneVoting) return false
          }
        }
        return true
      }

      if(this.currentTime == 'night'){
        for(let i in this.players){
          let player = this.players[i]
          if(player.canMoveAtNight && !player.doneWihtNightAction && player.alive) return false
        }
        return true
      }

      return false
    },
    unFinishedPlayers(){
      let list = []

      if(this.currentTime == 'night'){

        for(let i in this.players){
          let player = this.players[i]
          if(player.team == 'wolves' && !player.doneWihtNightAction && player.alive)  list.push(player.name)
        }

        for(let i in this.players){
          let player = this.players[i]
          if(player.team == 'villagers' && !player.doneWihtNightAction && player.alive && player.canMoveAtNight)  list.push(player.name)
        }

        for(let i in this.players){
          let player = this.players[i]
          if(player.team == 'solos' && !player.doneWihtNightAction && player.alive  && player.canMoveAtNight)  list.push(player.name)
        }

        
      }

      if(this.currentTime == 'day'){

        for(let i in this.players){
          let player = this.players[i]
          if(!player.doneVoting && player.alive)  list.push(player.name)
        }

        
      }

      return list

    },

    currentSurvivors(){
      let list = {}
      let count = 0
      for(let i in this.players){
        let player = this.players[i]
        if(player.team =='wolves') count++
      }
      list.wolves = count
      count = 0

      for(let i in this.players){
        let player = this.players[i]
        if(player.team =='villagers') count++
      }
      list.villagers = count
      count = 0

      for(let i in this.players){
        let player = this.players[i]
        if(player.team =='solos') count++
      }
      list.solos =count
      count = 0

      return list
    },

    unVotedWolves(){
      let list = []
      for(let i in this.players){
        let player = this.players[i]
        if(player.team == 'wolves' && !player.doneWihtNightAction)  list.push(player.name)
      }

      return list
    },



    
    
    
  },
  mounted(){
    console.clear()
    // console.log(randomWords());
    this.test()
    // if(localStorage.username){
    //   this.username= localStorage.username
    //   this.username = randomWords(); 
    // }

    // console.log('hello')
    for(let i in this.roles.wolves){
      let role = this.roles.wolves[i]
      if(!role.default) break;
      this.tempWolves.push(role.name)
      role.assigned = true
    }

    for(let i in this.roles.villagers){
      // console.log('hello')
      let role = this.roles.villagers[i]
      if(!role.default) break;
      this.tempVillagers.push(role.name)
      role.assigned = true
    }
    // console.log('hello')

    for(let i in this.roles.solos){
      let role = this.roles.solos[i]
      if(!role.default) break;
      this.tempSolos.push(role.name)
      role.assigned = true
    }
    // console.log('hello')
    
    // console.log(this.tempWolves)
    // console.log(this.tempVillagers)
    // console.log(this.tempSolos)
  }
}
</script>

<style>
html {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 5px; */
  /* background-color: #E0B589; */
  /* padding: 0 0; */
  margin: 0;
  /* height: 100%; */
}
body{
  margin:0;
  padding:0;
  
  height: 100vh;
  /* overflow: hidden; */
  
  
  /* background-color: #E0B589; */
}

.warning{
  color:crimson;
}


@import './assets/styles/style.scss';
/* -------------------------------------------------------- */

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  /* bottom: 0; */
  /* height: 667px; */
  z-index: 98;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;
  
  width: 75%;
  max-width: 400px;
  background-color: #f2f2f2;
  border-radius: 16px;
  
  padding: 25px;
}

.modal h1 {
  color: #222;
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 15px;
}
 
.modal p {
  color: #666;
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 15px;
}

.fade-in {
	opacity: 1;
	animation-name: fadeInOpacity;
	animation-iteration-count: 1;
	animation-timing-function: ease-in;
	animation-duration: .4s;
}
@keyframes fadeInOpacity {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}


.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

input[type=text], select {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}

input[type=number], select {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}

.modal  .create {
  width: 100%;
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 10px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal  .join {
  width: 100%;
  background-color: #6495ed;
  color: white;
  padding: 14px 20px;
  margin: 5px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal  .cancel {
  width: 100%;
  background-color: firebrick;
  color: white;
  padding: 14px 20px;
  margin: 20px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tab-button {
  width: 25%;
  background-color:  #363945;
  /* opacity: 0.3; */
  color: white;
  padding: 10px 5px;
  margin: 10px 3%;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.undo-button{
  float:right;
  margin-right:15px;
  width: auto;
  background-color: grey;
  color: white;
  padding: 4px 5px;
  /* margin: 5px 0; */
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #3498db;
  width: 80px;
  height: 80px;

  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;

  margin: 30px auto;

  
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}




/*  cards */
.players{
  padding-right: 5px;
  padding-left: 5px;
  color: #2c3e50;
  margin-top: 20px;
  /* position: relative; */
  /* background-color: red; */
  display: flex;
  /* width: 100%; */

  /* background: tomato; */
  /* display: flex; */
  flex-flow: row wrap;
  align-content: space-between;
  justify-content: space-between;

}
.card {
  background-color: #939597;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  width: 30%;
  border-radius: 5px;
  margin-left: 1.5%;

  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); /* this adds the "card" effect */
  /* padding: 0px; */
  text-align: center;
  background-color: #f1f1f1;
  margin-bottom: 15px;
  height: auto;
  font-size: 80%;
}

.line-break {
  width: 100%;
}

.card img {
  margin-top: 5px;
  margin-bottom: 0px;
  border-radius: 5px 5px 0 0;
  height: 30px;
  width: auto;
}

.card .name{
  font-weight: bold;
  margin-bottom: px;
  padding: 10px
  /* color: red */
}

.targeted{
  background-color: #3CB371
}



/* nav  */
.nav{
  position: relative;
  padding-top: 10px;
}

.nav img{
  margin-left: 0px;
  margin-bottom: -9px;
  width:30px;
  height:auto;
  /* position: absolute; */
  /* right: -20px */
  /* right: 0; */

}


/* controller  */
.controller{
  /* position: */
  width: 90%;
  margin: 0 auto ;
  margin-top: 10px;
  /* background-color: green; */

}
.controller button {
  width: 120px;
  background-color: #6495ed;
  color: white;
  padding: 14px 8px;
  margin: 5px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controller .nextButton {
  width: 80px;
  background-color: #5F9EA0;
}

.controller .skipButton {
  width: 80px;
  background-color:	#A52A2A;
}

.controller .clearButton {
  width: 80px;
  background-color:		#7B68EE;
}

.controller .actionButton {
  width: 80px;
  background-color:		#DC143C;
}


.closeButton{
  /* width: 120px; */
  /* background-color: #6495ed; */
  color: white;
  padding: 14px 8px;
  margin: 5px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 120px;
  background-color:		#7B68EE;
}

.okButton{
  /* width: 120px; */
  /* background-color: #6495ed; */
  color: white;
  padding: 14px 8px;
  margin: 5px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 120px;
  background-color:		#DC143C;
}



.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #3498db;
  width: 80px;
  height: 80px;

  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;

  margin: 30px auto;

  
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}



</style>
