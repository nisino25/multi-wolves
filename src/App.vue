<template>
<html >
  <head></head>
  <body :style="currentTime == 'day' ? 'background-color: #E0B589;' : 'background-color: #363945; color: white'" >
      <div class="wrapper" style="">

      <div class="container" v-if="readyToPlay">

        <div class="nav" style="margin-bottom: 10px;">
          <strong>Werewolf: [{{roomCode}}]</strong> &nbsp;
          
          <!-- <span>Possibly {{teamSituation}}</span><br><br> -->
          <span v-if="this.detailData?.length ==1 && this.gameStatus == 'ready'"  style="margin-bottom:20px">Day 0
          <img v-if="currentTime == 'day'"  src="../public/icons/sun.png">
          <img v-if="currentTime == 'night'" style="filter: invert(100%);"  src="../public/icons/moon.png">
          </span>
          
          <span v-else style="margin-bottom:20px">Day {{detailData.length}}
          <img v-if="currentTime == 'day'"  src="../public/icons/sun.png">
          <img v-if="currentTime == 'night'" style="filter: invert(100%);"  src="../public/icons/moon.png">
          </span>
        </div>
        
        <div class="players row">
          <template  v-for="(player,index) in sortedObj" :key="index">
            <div class="card"  :style="[!player.alive  ? 'opacity: 0.5 ' : '']" :class="[targetVisible(player) ? 'targeted' : '']"  @click="clickingAPlayer(player)">

              <img v-if="player.alive" src="../public/icons/user.png" alt="Avatar">
              <i v-if="!player.alive" class='fas fa-skull-crossbones' style='font-size:35px;color:red; margin-top: 5px'></i>

              <div class="container">
                <!-- name   -->
                <span class="name" :style="myPlayer?.name == player.name ? 'color:blue': ''">{{player.name}}</span>
                <hr>
                

                <!-- for the seer and wolves -->
                <template v-if="canISeeYourRole(player)">
                  <span  style="color:red">{{player.team}} <br> {{player.role}}</span>
                </template>

                <template v-else>
                  
                  <span v-if="myPlayer?.name == player.name" :style="getColor(player.team)">{{player.team}}</span><br>
                  <span v-if="myPlayer?.name == player.name">{{player.role}}</span><br>
                </template>

                <!-- <span>{{player.doneWihtNightAction}}</span> -->
                
              </div>
            </div>
            <div v-if="(index+1) % 3==0" cals="line-break">
            
            </div>  
          </template>

 
        </div>

        <div class="controller" v-if="!winner">

            <template v-if="myPlayer.alive">

              <template v-if="myPlayer.waiting">
                <span>Waiting for other players {{liveWaitingList.length}} / {{members.length}}</span>
                <div class="loader"></div>
              </template>


              <template v-else>

                <button v-if="myPlayer.done" @click="ready()" class="blink" style="width: 80px">Ready</button>

                

                <button v-if="!myPlayer.done && myPlayer.role !== 'loudmouth' && currentTime == 'night'" :style="[confirmCheck() ? '' : 'opacity: 0.4']" @click="confirm()" style="background-color: #6495ed; width:80px;" >Confirm</button>

                <button v-if="!myPlayer.done && currentTime == 'day'" :style="[confirmCheck() ? '' : 'opacity: 0.4']" @click="confirm()" style="background-color: #6495ed; width:80px;" >Confirm</button>

                <button v-if="canIOpenChat()" @click="showingChat = true" class="purple-blink" style="width: 100px; margin-left: 20px; margin-right: 20px">Open Chat</button>

                <button v-if="!myPlayer.done && latestData.isNightOver && !latestData.isDayOver" :style="[myPlayer.target ? '' : '']" @click="myPlayer.target = 'skipping'" style="background-color: #8A2BE2; margin-left:10px; width: 80px" >Skip</button>

                <div v-if=" latestData.isNightOver && !latestData.isDayOver && !latestData.isVotingOver">
                  <span v-if="!myPlayer.target && !message">Pick one for the voting</span>
                  <!-- <span v-if="myPlayer.target">You pick {{myPlayer.target}}</span> -->
                  <span style="color:red" v-if="myPlayer.target">You are choosing {{myPlayer.target}}</span>
                  
                </div>  

                
              </template>

              
            
            </template>

            <template v-if="!myPlayer.alive">
              <h1 style="color:red; font-size: 150%;">You have been killed</h1>
            </template>
              
              
              






          <hr>
          <!-- notice --------------------------------------------- -->
          <div>
            <template v-if="currentTime == 'night' && myPlayer.alive">
              <span>{{rules[myPlayer?.role]?.todo}} </span> <br>
              <span v-if="myPlayer.role == 'loudmouth' && myPlayer.permanentTarget !== ''">You are choosing {{myPlayer.permanentTarget}} as your target  </span> <br>
              <span v-if="message" style="color:red">{{message}} <br></span>

              <span style='color:red' v-if="detailData.length == 1 && !latestData.isNightOver && myPlayer.team == 'wolves' && gameStatus !== 'ready' && !liveWaitingList.includes(username)">You cannot kill anyone at first night</span>

              

            </template>

          </div>
          

          <!-- developing and log --------------------------------------------- -->
          <div>

            <!-- <span style="color:red" >{{myPlayer.target}}</span> -->

            <!-- <hr> -->
          </div>

        </div>

        <div v-if="winner">
          <h1>{{winner}} won!</h1>
        </div>


      </div>
  
    </div>

    <!-- beggining modal -->
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
                    <input type="text" placeholder="Type room cocde.." v-model="roomCode"  autocapitalize="none" >
                    <button @click="joinARoom()" class="join">Join a Room</button>

                  </form>
                </div>

                <div v-if="modalStatus == 3">
                  <form onsubmit="event.preventDefault()">
                    <span>Welcone {{username}} !</span><br>
                    <span>Currently {{members.length}}/9</span><br>
                      <span>Room Code: <strong style="font-size:175%">{{roomCode}}</strong></span><br>

                      <button v-if="onlineRoll == 'host'" :style="[members.length >= 4 ? '' : 'opacity: 0.2']" @click="closeTheRoom" class="closeButton">Close the Room</button><br>

                      <div v-if="onlineStatus == 'waiting'" class="loader"></div>

                     <button v-if="!members?.includes(username)"  @click="joinARoom" class="closeButton">Try again</button>

                     <br>

                     <!-- <samp>{{members}}</samp> -->

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

    <!-- message modal -->
    <transition name="fade" >
          <div class='modal-overlay fade-in' v-if="readyToPlay && !myPlayer?.read" style="height: 100vh">
              <div class="modal" style=" transition : all 0.6s ease 0s;"> 
                <div>
                  <form onsubmit="event.preventDefault()">

                    <strong v-if="!latestData.isVotingOver" >This is what happened last night <br></strong>

                    <strong v-if="latestData.isVotingOver" >This is what happened at the voting <br></strong>
                    <hr>

                    <span>{{officialLog}}</span><br><br>
                    

                    <strong v-if="winner !== ''" style="color:blue"> {{winner}} just won!</strong>

                    <hr>
                    <button @click="clearLog()" class="okButton">OK</button>


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
                      <!-- <span v-if="latestData" style="color:black">{{latestData.waitingList}}</span> -->

                      
                  </form>
                </div>

                


              </div>
          </div>

    </transition>


    <!-- message modal -->

    <transition name="fade" >
          <div class='modal-overlay fade-in' v-if="readyToPlay && showingChat" style="height: 100vh">
              <div class="modal" style=" transition : all 0.6s ease 0s; color:black;overflow: hidden; height: 75vh; width: 90vw "> 
                <section class="msger" id="msger">
                  <header class="msger-header">
                    <div class="msger-header-title">
                      <i class="fas fa-comment-alt"></i> Team Wolces Chat
                    </div>
                  </header>

                  <main class="msger-chat" id="msger-chat">
                    <template v-for="message in liveChatList" :key="message.key">
                      <div :class="message.username !== username ? 'msg left-msg' : 'msg right-msg'">

                        <div class="msg-bubble">
                          <div class="msg-info">
                            <div class="msg-info-name" style="opacity:0.6; font-size:80% ">{{message.username}}</div>
                            <!-- <div class="msg-info-time">{{message.timestamp.toLocaleTimeString()}}</div> -->
                          </div>

                          <div class="msg-text" style="float:left; font-weight: bold;" >
                            {{message.content}}
                          </div>
                        </div>
                      </div>

                    </template>
                  </main>

                    

                  <form class="msger-inputarea" @submit.prevent="sendMessage()">
                    <input type="text" class="msger-input" placeholder="Enter your message..." v-model="currentMessage">
                    <button type="submit" class="msger-send-btn">Send</button>
                  </form>
                </section>


                <button @click="showingChat = false" class="close-button">Close the chat</button>

                


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
      // readyToPlay: true,
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
      winner: '',

      currentPlayer: undefined,
      choosingNow: false,
      generalMessage: undefined,
      generalCounter: undefined,

      // -----------------------------------
      skipTheFirstStep: false,
      // skipTheFirstStep: true,
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
      message: undefined,
      devMessage: '',
      officialLog: '',
      
      showingChat: false,
      chatList: {},
      currentMessage: '',



    }
  },
  methods:{

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

      

      // -----------------------------------------------------------------------------------------

      

      // // every team
      if(this.teamSituation == 'every team'){
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
              if (d < (this.roles.villagers.length )/ this.generalCounter){
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

      player.team = 'wolves'
      player.role =  this.getRandomRole('wolves')

      randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
      theName = this.notAssignedPlayers[randomNum]
      player = this.players.find(o => o.name === theName)
      player.team = 'villagers'
      player.role = this.getRandomRole('villagers')

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

    

    getTheCurrentPlayer(){

      this.currentPlayer = this.players.find(o => o.name === this.unFinishedPlayers[0]) 
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
      
      // if(!this.skipTheFirstStep) return
      this.username = randomWords(); 
      this.modalStatus++
    },





    // setingup online -----------------
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
        winner: this.winner,
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
      console.clear()
      // clipboard(this.roomCode)
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
      this.detailData =[{nightLog: [], dayLog: [], isNightOver: false,isVotingOver:false, isDayOver: false, officialLog: [], waitingList:[],gameStatus: 'ready'}]
      const ref = db.collection('werewolf')
      ref.doc(`${this.roomCode}`).update({
        gameStatus: 'ready',
        players: this.players,
        detailData: JSON.stringify( this.detailData),
        officialLog: '',
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
    multiAssignRoles(){
      console.clear()

      // initalizing the obj
      let count = 0
      this.players = {}
      this.chatList = {}
      while(count < this.members.length){
        this.players[this.members[count]] ={name: this.members[count], alive: true,role: '',team: '',target: '',targetedBy: 0, dayVotingTarget: '', doneVoting: true, seerList: [],done: true, waiting: false, sort: count,read: true, chatList: [],permanentTarget: '', revealedRole: false, firstTime: true,}
        this.chatList[this.members[count]] = []
        count++
      }

      


      // assigining roles -----------------------------------------------------------
      // change the max wolves num
      if(this.theLength < 5){
        this.maxWolvesNum = 1
      }

      // get one wolf, and one vilalger
      // first wolf
      let randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
      let randomKey = this.notAssignedPlayers[randomNum]
      let player = this.players[randomKey]
      player.team = 'wolves'
      player.role =  this.getRandomRole('wolves')

      // first villager
      randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
      randomKey = this.notAssignedPlayers[randomNum]
      player = this.players[randomKey]
      player.team = 'villagers'
      player.role = this.getRandomRole('villagers')

      // assign the roles to the rest of the team --------------
      while(this.notAssignedPlayers.length !== 0){

        let randomNum = Math.floor(Math.random() * this.notAssignedPlayers.length);
        let randomKey = this.notAssignedPlayers[randomNum]
        let player = this.players[randomKey]

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
      // let msg =''
      // for(let i in this.players){
      //   let theChosenOne = this.players[i]
      //   // console.log(i)
      //   // msg  = msg  + "\n" + this.players[i].name
      //   msg  = msg  + "\n" + i + ': ' + theChosenOne.role
        
      // }
      // msg = msg  + "\n" 
      // alert(msg)
      // if(msg.length >1) return 

      return 

    


      
    },
    nightMove(role){
      if(role == 'villager' || role == 'fool'  || role == 'sister' || role == 'handsomeprince' ){
        return false
      }

      return true
    },
    confirmCheck(){

      if(this.currentTime == 'night' && this.myPlayer.role == 'detective'){
        if(this.myPlayer.target?.length == 2){
          return true
        }else{
          return false
        }
      }
      
      if(this.myPlayer.target) return true
    },
    targetVisible(target){
      if(this.currentTime == 'night' && this.myPlayer.role == 'detective'){
        // if(this.myPlayer.target == 'undefined') return false

        if(this.myPlayer.target[0] == target.name ) return true
        if(this.myPlayer.target[1] == target.name ) return true
      }

      if(this.currentTime == 'night' && this.myPlayer.role == 'loudmouth'){
        // if(this.myPlayer.target == 'undefined') return false

        if(this.myPlayer.permanentTarget == target.name ) return true
      }
      

      if(this.myPlayer.target == target.name){
        return true
      }

      return false
    },
    

    // important----------------------------------------------------
    ReciveTheData(){
      
      db.collection("werewolf").doc(`${this.roomCode}`)
      .onSnapshot((doc) => {
        
        if(this.onlineStatus == 'waiting'){
          // console.log('new data incoming ------------')
          this.members = JSON.parse( doc.data()?.members)

          if(!this.members.includes(this.username)){
            this.joinARoom()
            return 
          }
          if(doc.data().gameStatus == 'ready'){
            console.log('ready to go')
            this.gameStatus = 'ready'
            this.onlineStatus = 'ready'
            this.modalStatus++
            // this.ready()

            this.detailData = JSON.parse(doc.data().detailData)
            // this needed be parse 
            // this.players = JSON.parse(doc.data().players)
            this.players = doc.data().players
            console.log('got the intial players data')
            this.players = doc.data().players
            
            // skip function -----
            if(this.skipTheFirstStep){
              this.showModal = false; 
              this.readyToPlay = true;
              this.ready()
            }
            
            
          }
          

        }else if(this.onlineStatus == 'ready'){
          // this is where everybody gets the info---------------------
          // console.log('new data')
          this.detailData= JSON.parse(doc.data().detailData)
          this.gameStatus = this.latestData.gameStatus
          this.winner =  doc.data().winner
          this.officialLog = doc.data().officialLog
 
          this.players = doc.data().players

          if(this.onlineRoll == 'host'){
            if(this.liveWaitingList.length == this.theLength){
              // very first time
              if(this.turnCount == 0){
                console.log('---------------')
                // console.log('advancing to the first night')
                this.turnCount++

                // this.detailData[0].gameStatus = 'playing'
                this.latestData.gameStatus = 'playing'

                // add the job for the seer not wolves for the first time
                this.toggleWaitingList()
                // this.latestData.waitingList = []

                this.updatingWholeData()

                // const ref = db.collection('werewolf')
                // ref.doc(`${this.roomCode}`).update({
                //   detailData: JSON.stringify(this.detailData)
                // })

              }else if(!this.latestData.isNightOver){
                
                console.log('turning to day, open for voting')

                this.turnCount++
                this.devMessage ='advancing to the first day'

                // death judge, no one can die at the first 
                this.checkTheNightResult()

                // winner judge, no one can win at this point
                this.judgeTheWinner()

                // change the day, and show them 
                this.latestData.isNightOver = true


                // toggle for voting, madakana?
                this.toggleWaitingList()

                // and send the data now
                this.updatingWholeData()
                // this.updatingData()

                return

                
                
              }else if(!this.latestData.isVotingOver){

                console.log('showing the votign result')

                // death judge, for the voting
                this.checkTheVotingResult()

                // winner judge, 
                this.judgeTheWinner()

                // change the day, and show them 
                this.latestData.isVotingOver = true

                // toggle for reading, and next step false
                this.toggleWaitingList()

                // and send the data now
                this.updatingWholeData()

                return

                
                
              }else if(this.latestData.isVotingOver){

                console.log('advancing to the nth night')
                this.latestData.isDayOver = true

                
                // this.latestData.isDayOver = true



                // toggle for reading, and next step false
                this.toggleWaitingList()

                // add more data
                this.detailData.push({nightLog: [], dayLog: [], isNightOver: false,isVotingOver:false, isDayOver: false, officialLog: [], waitingList:[],gameStatus: 'ready'})

                // and send the data now
                this.updatingWholeData()

                return

                
              }
            }
          }
        }
          return 
      }
      )
    },

  
    // actual multi game ------------

    ready(){
      // if(this.waitingForOthers) return

      // if(this.latestData.waitingList.includes(this.username)) return 

      // this.latestData.waitingList.push(this.username)
      this.myPlayer.waiting = true
      
      if(this.myPlayer.role == 'seer') this.myPlayer.target = ''
      this.message = undefined

      // this.myPlayer.chatList.push({timestamp: Date.now(), username: this.username, content: 'sup' })

      this.updatingData()


      // const ref = db.collection('werewolf')
      // ref.doc(`${this.roomCode}`).update({
      //   detailData: JSON.stringify( this.detailData)
      //   // members: JSON.stringify([this.username]),

      // })

      this.devMessage= 'adding my data'
    },

    updatingData(){
      
      // if(this.waitingForOthers) return

      // if(this.latestData.waitingList.includes(this.username)) return 

      // this.latestData.waitingList.push(this.username)

      // how to get index of players
      // let index = this.players.indexOf(this.username)
      let updatingTarget = `players.${this.username}`

      const ref = db.collection('werewolf')
      ref.doc(`${this.roomCode}`).update({
        // detailData: JSON.stringify( this.detailData)
       [updatingTarget]: this.myPlayer
        // [updatingTarget]: this.myPlayer

      })

    },

    updatingWholeData(){
      // if(this.waitingForOthers) return

      // if(this.latestData.waitingList.includes(this.username)) return 

      // this.latestData.waitingList.push(this.username)

      // how to get index of players
      // let index = this.players.indexOf(this.username)
      // let updatingTarget = `players.${this.username}`
      // console.log(this.officialLog)
      const ref = db.collection('werewolf')
      ref.doc(`${this.roomCode}`).update({
        detailData: JSON.stringify( this.detailData),
        players: this.players,
        winner: this.winner,
        officialLog: this.officialLog
        // [updatingTarget]: this.myPlayer

      })

      // console.log('adding my data')
    },

    toggleWaitingList(){
      // first time when it changed

      // everybody has to click yes
      // this.latestData.waitingList = []

      if(this.detailData?.length ==1 && this.gameStatus == 'ready'){

        console.log('first time toggling ')
        for(let i in this.players){
          let player = this.players[i]
          // everybody has to click yes, unless skip function
          player.waiting = false
          player.ready = true
          player.done = true

          if(this.skipTheFirstStep){
            player.waiting = true
          }  

          if(this.nightMove(player.role) && player.role !== 'werewolf'){
            // player
            player.ready = false
            player.done = false
            player.waiting = false
          }

          if(player.team == 'wolves'){
            player.ready = true
            player.done = true
            // player.waiting = false
          }

          
        }

        return

        

        // update: detailData with waiting list
      }

      // after evryone ready for the voting
      if(this.latestData.isNightOver && !this.latestData.isVotingOver){
        console.log('toggle for voting')
        for(let i in this.players){
          let player = this.players[i]
          player.done = false
          player.ready = false
          player.read = false
          player.waiting = false
          player.target = ''
        }
        return
      }

      // showing the message and toggle
      if(this.latestData.isVotingOver && !this.latestData.isDayOver){
        console.log('toggle for showing voting result')
        
        for(let i in this.players){
          let player = this.players[i]
          player.ready = true
          player.done = true
          player.target = ''
          
          player.waiting = false
          player.read = false
          // player.waiting = false

          // if(player.role == 'villager') player.waiting = true

        }

        return
      }

      if(this.latestData.isDayOver){
        console.log('going to night rihht?')
        
        for(let i in this.players){
          let player = this.players[i]
          player.ready = false
          player.done = false
          player.waiting = false
          // player.waiting = false

          if(!this.nightMove(player.role)){
            player.waiting = false
            player.ready = true
            player.done = true

            if(this.skipTheFirstStep){
              player.waiting = true
            }
            
          }
          
          if(player.role == 'loudmouth'){
            player.waiting = false
            player.ready = true
            player.done = true

            // if(this.skipTheFirstStep){
            //   player.waiting = true
            // }
            
          }

        }

        return
      }
    

      
    },

    canISeeYourRole(target){
      let flag = false

      if(target.name == this.myPlayer.name) return false

      if(this.winner){
        return true
      }

      if(this.myPlayer.team == 'wolves'){
        if(target.team == 'wolves') return true
      }

      if(this.myPlayer.role == 'seer'){
        if(this.myPlayer.seerList?.includes(target.name)) return true
      }

      if(this.myPlayer.role == 'sister'){
        if(target.role == 'sister') return true
      }

      if(target.revealedRole){
        return true
      }

      return flag

    },

    canIOpenChat(){
      if(this.currentTime == 'day') return false
      if(this.aliveWolvesCount <= 1) return false

      if(this.myPlayer.team !== 'wolves'){
        
        // if onlye one survivoe then false retu

        return false
      }

      return true


    },

    clickingAPlayer(target){
      
      // if(!this.choosingNow) return
      if(this.myPlayer?.done && this.myPlayer.role !== 'loudmouth') return
      if(!this.myPlayer.alive) return

      

      this.message = undefined

      // most likely cannot pick yourself right?
      if(this.myPlayer.name == target.name){
        this.message = 'Cannot choose yourself'
        this.myPlayer.target = undefined
        this.myPlayer.done = false
        return
      }

      // for the voting
      if(this.currentTime == 'day'){
        this.message = `You are voting "${target.name}" `
        this.myPlayer.target = target.name
        return
      }


      // for the wolves targeting
      if(this.myPlayer.team == 'wolves'){
        if(target.team == 'wolves'){
          this.message = 'Cannot choose the same team'
          this.myPlayer.target = undefined
          this.myPlayer.done = false
          return 
        }

        this.message = `You are chosing "${target.name}" `

        this.myPlayer.target = target.name
        console.log(target.name)
        // this.myPlayer.done = true
        return
      }

      if(this.myPlayer.role == 'seer'){

        this.message = `You are chosing "${target.name}" `
        this.myPlayer.target = target.name
        return
      }

      if(this.myPlayer.role == 'detective'){
        this.message = 'choosing at least'
        if(this.myPlayer.target == ''){
          this.myPlayer.target = []
          this.myPlayer.target.push(target.name)
        }else if(this.myPlayer.target.includes(target.name)){
          this.myPlayer.target.splice(this.myPlayer.target.indexOf(target.name), 1)
        }else if(this.myPlayer.target.length == 1){
          this.myPlayer.target.push(target.name)
        }else if(this.myPlayer.target.length == 2){
          this.myPlayer.target[0] = this.myPlayer.target[1]
          this.myPlayer.target[1] = target.name
        }

        
        // this.message = `You are chosing "${target.name}" `
        // this.myPlayer.target = target.name
        
        // this.myPlayer.seerList.push(target.name)
        // this.myPlayer.done = true

        // this.updatingData()

        

        // this.myPlayer.target = target.name
        // this.currentPlayer.doneWihtNightAction = true
        return
      }

      if(this.myPlayer.role == 'loudmouth'){
        // this.message = `Your target is ${target.name}`
        this.myPlayer.permanentTarget = target.name
        this.myPlayer.done = true

        
        // this.message = `You are chosing "${target.name}" `
        // this.myPlayer.target = target.name
        
        // this.myPlayer.seerList.push(target.name)
        // this.myPlayer.done = true

        // this.updatingData()

        

        // this.myPlayer.target = target.name
        // this.currentPlayer.doneWihtNightAction = true
        return
      }
    },

    confirm(){
      if(this.currentTime == 'day'){
        if(this.myPlayer.target == '') return
        // let target = this.players.find(o => o.name === this.myPlayer.target)
        // this.message = undefined
        // this.myPlayer.target = 
        this.myPlayer.done = true
        this.myPlayer.waiting = true
        this.updatingData()
        return
      }
      if(this.myPlayer.role == 'seer'){
        
        let target = this.players[this.myPlayer.target]
        this.message = `"${target.name}" is ${target.role}`
        this.myPlayer.seerList.push(target.name)
        this.myPlayer.done = true
        this.updatingData()
        return
      }

      if(this.myPlayer.role == 'detective'){
        let target1 = this.players[this.myPlayer.target[0]]
        let target2 = this.players[this.myPlayer.target[1]]

        if(target1.team == target2.team){
          this.message = `${target1.name} and ${target2.name} are on the same team`
        }else{
          this.message = `${target1.name} and ${target2.name} are on the different team`
        }

        // this.myPlayer.seerList.push(target.name)
        this.myPlayer.done = true
        this.updatingData()
        return
      }

      

      if(this.myPlayer.role == 'werewolf'){
        let target = this.players[this.myPlayer.target]
        this.message = `"${target.name}" is your target`
        this.myPlayer.done = true
        this.updatingData()
        return
      }

      
    },

    clearLog(){
      this.myPlayer.read = true
      this.updatingData()
    },



    checkTheNightResult(){
      // if first night 
      if(this.detailData.length == 1){
        this.officialLog =`Last night: nobody died`
        return
      }

      // dont forget to turn off the target after 


      // wolves choosing the target as a team

      let theTarget = this.getWolvesVotingResult()


      // do the killing if there is nobody protecting them
      this.officialLog = `${theTarget.name} was killed.`
      theTarget.alive = false 


      if(theTarget.role == 'loudmouth'){
        this.officialLog = this.officialLog + `\n When ${theTarget.name} as a looudmouth was killed, the victim revealed ${theTarget.permanentTarget}'s role is ${this.players[theTarget.permanentTarget].role}.`

        theTarget.revealedRole = true
        this.players[theTarget.permanentTarget].revealedRole = true
      }

      // do the killing for the solios

      // clear the target ------------------
      this.clearAllTargets()
      

    },
    checkTheVotingResult(){

      // for now jus assume everyone skips 
      let target = this.getVillagerVotingResult()
      target = this.players[target?.name]
      
      
      if(!target){
        this.officialLog = 'Villagers could not decide the victim from voting'
        return 
      }

      


      // if not get the most voted or random

      // do the killing if there is nobody protecting them
      
      if(target){
        if(target.role == 'handsomeprince' && target.firstTime){
          this.officialLog = `Villagers decided to kill ${target.name}, but the target was handsome priince, and the target survived.`
          target.firstTime = false
          target.revealedRole = true

          return 
        }
        this.officialLog = `Villagers voted and killed ${target.name} succesfully.`

        if(target.role == 'loudmouth'){
          this.officialLog = this.officialLog + `\n When ${target.name} as a looudmouth was killed, the victim revealed ${target.permanentTarget}'s role is ${this.players[target.permanentTarget].role}.`

          target.revealedRole = true
          this.players[target.permanentTarget].revealedRole = true
        }
        
        // this.latestData.officialLog.push(`${theTarget.name} was killed`)
        target.alive = false 

        

        if(target.role == 'fool'){
          this.winner = `${target.name} as a fool`
        }

      }

      // do the killing for the solios

    },
    getVillagerVotingResult(){

      // clear the targetcount
      this.clearCount()

      // this.clearTargetAndCounting()
      let list = []
      let theTarget = undefined

      for(let i in this.players){
        let player = this.players[i]
        if(player.alive && player.target !== 'skipping'){
          let target = this.players[player.target] 
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
        return undefined
      } 

      // if they choose only one person
      if(list.length == 1){
        theTarget = this.players[list[0]]
        this.generalMessage = `Villagers chose ${theTarget.name} to kill`
    
        this.clearCount()
        return theTarget
      }else if(list.length > 1){
        // pick no one because the vote is splited
        return false
      }

    },
    getWolvesVotingResult(){

      // clear the targetcount
      this.clearCount()
      
      // get the list
      let list = []
      let theTarget = undefined

      for(let i in this.players){
        let player = this.players[i]
        if(player.team  == 'wolves' && player.alive) {
          let target = this.players[player.target]
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

      // ------------------------------------------------------------
      // if they choose only one person
      if(list.length == 1){
        theTarget = this.players[list[0]] 
        this.generalMessage = `Wolves chose ${theTarget.name} unanimously`
        console.log(this.generalMessage) 
        return theTarget

      }else if(list.length> 1){
        // pick randomly
        let theName = this.getRandomValue(list)
        theTarget = this.players[theName]
        this.generalMessage = `Wolves' voting was splited so picked ${theTarget.name} randomly`
        console.log(this.generalMessage) 
        return theTarget
      }

    },
    clearCount(){
      for(let i in this.players){
        let player = this.players[i]
        player.targetedBy = 0
      }
    },
    clearAllTargets(){
      console.log('function here')
      for(let i in this.players){
        let player = this.players[i]
        if(player.alive){
          player.target = ''
        }
      }
    },
    judgeTheWinner(){
      let wolvesCount = 0
      let villagersCount = 0

      for(let i in this.players){
        let player = this.players[i]
        if(player.alive){
          if(player.team == 'wolves'){
            wolvesCount++
          }else if(player.team == 'villagers'){
            villagersCount++
          }
        }

      }
      if(wolvesCount == 0){
        this.winner = 'villagers'
        return true
      }else if(villagersCount == 0){
         this.winner = 'wolves'
        return true
      }

      return false
    },



    // chat -------  
    sendMessage(){
      this.myPlayer.chatList.push({timestamp: Date.now(), username: this.username, content: this.currentMessage })
      this.updatingData()
      this.currentMessage = ''
      
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
    latestIndex(){
      // localStorage.werewolfGameData = JSON.stringify(this.latestData.nightLog)
    },

    // ------------------------------
    username(){
      localStorage.username = this.username
    },

    liveChatList(){
      // console.log(chatBox)
      if(!this.showingChat) return
      var chatBox = document.getElementById('msger-chat');
      chatBox.scrollTop = 1000

      // window.setInterval(function() {
        
      // }, 5000);
    },

    // ------------------------------
    roomCode(){
      if(!this.skipFlag) return
      if(this.roomCode.length == 5){
        this.joinARoom()
      }
    },

    winner(){
      console.log(`this winner is ${this.winner}`)
    },


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
        if(!player.role) list.push(i)
        if(player.role == '') list.push(i)
      }
      return list
    },
    // -------------------------------------------------------------
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
      let list =[]
      for(let i in this.players){
        let player = this.players[i]
        if(player.waiting || !player.alive) list.push(player.name)
      }
      return list
    },

    liveChatList(){
      let list =[]
      for(let i in this.players){
        let player = this.players[i]
        for(let c in player.chatList){
          list.push(player.chatList[c])
        }
        
      }
      list = list.sort(function(x, y){
        return x.timestamp - y.timestamp;
      })

      return list
    },

    aliveWolvesCount(){
      let count =0
      for(let i in this.players){
        let player = this.players[i]
        if(player.team == 'wolves' && player.alive) count++
        
      }

      return count
    },

    
    myPlayer(){

      // return this.players.find(o => o.name === this.username) 
      // return this.latestData.players.find(o => o.name === this.username)
      return this.players[this.username]
    },

    waitingForOthers(){
      if(this.liveWaitingList?.includes(this.username)){
        return true
      }else{
        return false
      }
    },


    // ------------------------------
    
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

    


    // -----------------------------------------
    theLength(){
      return  Object.keys(this.players).length
    },
    sortedObj(){
      if(!this.players) return
      let list = []
      let count =0
      while(count < this.theLength){

        for(let i in this.players){
          let player = this.players[i]
          if(player.sort == count) list.push(player)
          // if(player.sort == count) list.push(i)
        }
        count++
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
.wrapper{
  max-width: 400px;
  margin: 0 auto;
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
  background-color: #3CB371;
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


/* ----------------------------------- */
.blink {
  background-color: #1c87c9;
  border: none;
  color: #eeeeee;
  cursor: pointer;
  display: inline-block;
  text-align: center;
  text-decoration: none;

  animation: glowing 1500ms infinite;
}


@keyframes glowing {
  0% {
    background-color: #2ba805;
    box-shadow: 0 0 3px #2ba805;
  }
  50% {
    background-color: #49e819;
    box-shadow: 0 0 10px #49e819;
  }
  100% {
    background-color: #2ba805;
    box-shadow: 0 0 3px #2ba805;
  }
}

.purple-blink {
  background-color: #1c87c9;
  border: none;
  color: #eeeeee;
  cursor: pointer;
  display: inline-block;
  text-align: center;
  text-decoration: none;

  animation: purple-glowing 1500ms infinite;
}


@keyframes purple-glowing {
  0% {
    background-color: #9370DB;
    box-shadow: 0 0 3px #9370DB;
  }
  50% {
    background-color:	#EE82EE;
    box-shadow: 0 0 10px 	#EE82EE
  }
  100% {
    background-color: #9370DB;
    box-shadow: 0 0 3px #9370DB;
  }
}


:root {
  --body-bg: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  --msger-bg: #fff;
  --border: 2px solid #ddd;
  --left-msg-bg: #ececec;
  --right-msg-bg: #579ffb;
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}



.msger {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  width: 100%;
  max-width: 867px;
  margin: 0 auto;
  height: calc(100% - 50px);
  border: var(--border);
  border-radius: 5px;
  background: var(--msger-bg);
  box-shadow: 0 15px 15px -5px rgba(0, 0, 0, 0.2);
}

.msger-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: var(--border);
  background: #eee;
  color: #666;
}

.msger-chat {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.msger-chat::-webkit-scrollbar {
  width: 6px;
}
.msger-chat::-webkit-scrollbar-track {
  /* background: #ddd; */
}
.msger-chat::-webkit-scrollbar-thumb {
  /* background: #bdbdbd; */
}
.msg {
  display: flex;
  align-items: flex-end;
}
.msg:last-of-type {
  margin: 0;
}
.msg-bubble {
  max-width: 450px;
  padding: 10px;
  border-radius: 15px;
  background: var(--left-msg-bg);
  margin-bottom: 5px;
}
.msg-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}
.msg-info-name {
  margin-right: 10px;
  font-weight: bold;
}
.msg-info-time {
  font-size: 0.85em;
}

.left-msg .msg-bubble {
  border-bottom-left-radius: 0;
}

.right-msg {
  flex-direction: row-reverse;
}
.right-msg .msg-bubble {
  background: var(--right-msg-bg);
  color: #fff;
  border-bottom-right-radius: 0;
}
.right-msg .msg-img {
  margin: 0 0 0 10px;
}

.msger-inputarea {
  display: flex;
  padding: 10px;
  border-top: var(--border);
  background: #eee;
}
.msger-inputarea * {
  padding: 10px;
  border: none;
  border-radius: 3px;
  font-size: 1em;
}
.msger-input {
  flex: 1;
  background: #ddd;
}
.msger-send-btn {
  margin-left: 10px;
  background: rgb(0, 196, 65);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.23s;
}
.msger-send-btn:hover {
  background: rgb(0, 180, 50);
}

.msger-chat {
  /* background-color: #fcfcfe; */
  
}

.close-button {

  width: 200px;
  background-color:	#DC143C;
  width: 120px;
  color: white;
  padding: 10px 8px;
  margin: 5px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  margin-top: 15px;
}




</style>
