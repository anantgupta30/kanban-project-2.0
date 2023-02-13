

const board = {
    data: function(){
        return {
            name: localStorage.getItem('name'),
            content: '',
            summary_page: false,
            pending_listavail: false,
            completed_listavail: false,
            flag: '',
            count: 0,
            date: '',
            listcount: 0,
            cardcount: 0,
            listdeletecount: 0,
            lists_status: {'pending': [],'completed':[],'gone':[]},
            cards: {
               count: {'title':'My card','description': 'My description','deadline':'22-09-2022'}
            },
            lists: [],
            completedlists: []
        }
    },
    template: `
    <div>
        <link rel="stylesheet" href="/static/styles.css">
        <div class="kanban_title" style="margin-top: 20px; margin-left: 30px;">
            <h4>{{ name }}'s board</h4>
        </div>
        <div v-if="flag" class="Container" style="text-align: center;">
            <h4 style="text-align: center; margin-top: 200px;">There are no list in the board</h4>
            <button class="button2 center" type="submit" style="margin-top: 20px;" @click.prevent="addlist">Add list</button>
        </div>
        <div v-if="!flag" class="dd" style="padding-left: 5%;">
            <ol class="kanban To-do" style="max-width: 5500px;" type="A">
                <div class="kanban__title"><h2> To do</h2></div>
                <div class="flexcontainer">
                    <li :id="list.id" v-for="list in lists" v-show="true" style="list-style-type: none;" dropzone="move" @drop="drop($event,list)"   @dragover.prevent @dragenter.prevent>
                        <div class="Container bd-gray-200" style="border: 1px solid black;">
                            <h2 :id="list.id" class="title dd-handle" @blur="listcontents($event)" aria-valuetext="hello" contenteditable="true" style="padding-left: 5%; font-size: 200%;" autofocus>{{ list.title }} </h2><hr>
                            <ol style="padding: 10px;">
                                <div v-for="(card,index) in list.cards">
                                    <li v-if="card.status=='pending' && Date.parse(card.deadline)-Date.parse(date)>=0" :id="card.id" class="dd-item" draggable="true" @dragstart="drag($event,card,list,$el)" @dragover.prevent @dragenter.prevent style="width: min-content; -webkit-box-shadow: 2px 4px 6px 0 rgb(0 0 0 / 50%);">
                                        <h3 class="title dd-handle" id="h2" contenteditable="true" @blur="updatecard($event)" onfocus="document.execCommand('selectAll',false,null)" aria-placeholder="card-title">{{ card.title }}</h3>
                                        <div class="text" contenteditable="true" style="padding: 8px; word-break: break-word;" @blur="updatecard($event)">{{ card.description }}</div>
                                        <div class="text" :id="card.id" contenteditable="false" ><p style="color: black;" unselectable="on">To be done by: </p><input type="date" :min="date" style="color: green;" @blur="updatecard($event)" :value="card.deadline"></div>                                      
                                        <div :id="card.id" class="actions">
                                            <button class="addbutt" @click.prevent="deletecard(list.id,card.id,true)">Delete card</button>
                                            <button class="addbutt" @click.prevent="updatecard($event)">Mark as Complete</button>
                                        </div>    
                                    </li>  
                                </div>
                                <li v-if="!list.cards[0] || list.cards.filter((c) => c.status=='pending').length == 0  || list.cards.filter((c) => c.status=='pending').filter((c) => Date.parse(c.deadline)-Date.parse(date)>=0).length == 0"  class="dd-item" data-id="1">
                                    <h3 class="title dd-handle" >No card <br> available</h3>
                                </li>
                            </ol>
                            <hr>
                            <div class="actions">
                                <button class="addbutt" @click.prevent="addcard(list.id)">Add new card</button>
                            </div>     
                            <button :id="list.id" class="addbutt" @click.prevent="deletelist($event)">Delete List</button>
                            <button class="addbutt" @click.prevent="Export(list.id)">
                                EXPORT
                            </button>
                        </div>
                    </li>
                </div>
                <div class="actions">
                    <button class="addbutt" @click.prevent="addlist">Add new list</button>
                </div>
            </ol>
            <ol class="kanban Done" style="max-width: 1300px;">
                <h2>Done</h2>
                <div class="flexcontainer">
                    <li :id="list.id" v-for="list in lists" style="list-style-type: none;">
                        <div class="Container" style="border: 1px solid black;">
                            <h2 style="padding-left: 5%; font-size: 200%;" class="title dd-handle" >{{list.title}}</h2><hr>
                            <ol style="padding: 10px;">
                                <div v-for="card in list.cards">
                                    <li v-if="card.status=='completed'" :id="card.id" class="dd-item">
                                        <h3 class="title dd-handle" >{{card.title}}</h3>
                                        <div class="text" contenteditable="false">{{card.description}}</div>
                                        <div class="text" contenteditable="false" ><p style="color: green; font-size: medium;">Task Done on <br>{{card.completed_on}}</p></div>
                                        <div class="actions">
                                            <button class="addbutt" @click.prevent="deletecard(list.id,card.id,true)">Delete Card</button>
                                        </div>                                              
                                    </li>                                         
                                </div>
                                <li v-if="!list.cards[0] || list.cards.filter((c) => c.status!='completed').length == list.cards.length"  class="dd-item" data-id="1">
                                    <h3 class="title dd-handle" >No card <br> available</h3>
                                </li>
                            </ol>
                        </div>
                    </li>
                </div>
            </ol>
            <ol class="kanban Gone" style="max-width: 1300px;">
                <h2>Gone</h2>
                <div class="flexcontainer">
                    <li :id="list.id" v-for="list in lists" style="list-style-type: none;">
                        <div class="Container" style="border: 1px solid black;">
                            <h2 class="title dd-handle" style="padding-left: 5%; font-size: 200%;">{{list.title}}</h2><hr>
                            <ol style="padding: 10px;">
                                <div v-for="card in list.cards">
                                    <li v-if="card.status=='pending' && Date.parse(card.deadline)-Date.parse(date)<0" :id="card.id" class="dd-item" data-id="1">
                                        <h3 class="title dd-handle" >{{card.title}}</h3>
                                        <div class="text" contenteditable="false">{{card.description}}</div>
                                        <div class="text" contenteditable="false"><p style="color: red; font-size: medium;">Task Gone on {{card.deadline}}</p></div>
                                        <div class="actions">
                                            <button class="addbutt" @click.prevent="deletecard(list.id,card.id,true)">Delete Card</button>
                                        </div>                            
                                    </li>
                                </div>
                                <li v-if="lists_status.gone.filter((l) => l.id==list.id).length == 0 && list.cards.filter((c) => c.status!='gone').length == list.cards.length"  class="dd-item" data-id="1">
                                    <h3 class="title dd-handle" >No card <br> available</h3>
                                </li>
                            </ol>
                        </div>
                    </li>
                </div>
            </ol>
        </div>
        <a href="" download id="download" hidden></a>
        <menu class="kanban">
            <button @click.prevent="summary"><i class="material-icons">summary</i></button>
            <button @click.prevent="logout"><i class="material-icons">logout</i></button>
        </menu>
    </div>
    `,
    async beforeCreate() {
        const token = localStorage.getItem('auth-token')
        if(!token){
            this.$router.push('/sign_in')
        }
    },
    async mounted() {
        let today = new Date().toISOString().slice(0, 10)
        this.date = today
        const response = await fetch(`http://127.0.0.1:8080/api/list/${localStorage.getItem('id')}`, { 
                method: 'get', 
                mode: 'cors', 
                credentials: 'same-origin', 
                headers: { 'Content-type': 'application/json','Authentication-Token': localStorage.getItem('auth-token')} 
            })
        const body = await response.json()
        if(JSON.parse(body).length==0){
            this.flag = true
        }
        else{
            this.flag = false
            this.lists = JSON.parse(body)
            this.listcount = this.lists.length
            for(const i of this.lists){
                const cards = i.cards.filter((c) => c.status=='completed')
                const pend_cards = i.cards.filter((c) => c.status=='pending')
                const gone_cards = pend_cards.filter((p) => Date.parse(p.deadline)-Date.parse(this.date)<0)
                if(cards[0])
                    this.lists_status.completed.push({'id':i.id,'title':i.title,'cards':cards})
                if(gone_cards[0]){
                    this.lists_status.gone.push({'id':i.id,'title':i.title,'cards':gone_cards})
                }
                if(pend_cards[0] || i.cards==[]){
                    this.lists_status.pending.push({'id':i.id,'title':i.title,'cards':pend_cards})
                }
            }
        }
    }
    ,
    methods: {
        async logout() {
          const res = await fetch('/logout')
          if (res.ok) {
            localStorage.clear()
            this.$router.push('/sign_in')
          } 
        },
        summary(){
            this.$router.push(`/board/${localStorage.getItem('name')}/summary`)
        },
        drag(evt,card,list) {
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'move'
            evt.dataTransfer.setData('itemID',[card.id,list.id])
        },
        drop(evt,list){
            const data = evt.dataTransfer.getData('itemID').split(",")
            const received_list = this.lists.find((l) => l.id==data[1])
            const received_list_card = received_list.cards.find((card) => card.id==data[0])
            const x = evt.clientX, y = evt.clientY
            const elements_list = document.elementsFromPoint(x,y)
            const card_element = elements_list.find((i) => i.classList[0]=='dd-item')
            const cind = list.cards.find((c) => c.id==card_element.id)
            if(card_element && received_list.id==list.id){
                const cardind = list.cards.indexOf(cind)
                this.deletecard(received_list.id,received_list_card.id,false)
                list.cards.splice(cardind,0,received_list_card)

            }
            if(received_list.id!=list.id){
            for(const i of this.lists){
                if(i.id==list.id){
                    const ind = this.lists.indexOf(i)
                    const avail = this.lists[ind].cards.find((c) => c.id==received_list_card.id)
                    if(!avail){
                        this.lists[ind].cards.push(received_list_card)
                        this.deletecard(received_list.id,received_list_card.id,false)
                        this.updateservercard({'id':received_list_card.id,'list_id':list.id})
                    }
                }
            }}
        },
        async Export(id){
            const a = document.getElementById('download')
            a.href = 'http://127.0.0.1:8080/download/'+id
            a.click()
        },
        addlist() {
            if(this.listcount == 0){
                var title = 'untitled' + this.listcount
                let lcount = this.listcount
                while(true){
                    const lst = this.lists.find((l) => l.title==title)
                    if(lst){
                        lcount+=1
                        title = 'untitled' + lcount
                        continue
                    }
                    break
                }
                const new_list = {'id': 0, 'title': title, 'cards': []}
                this.lists.push(new_list)
                this.lists_status.pending.push(new_list)
                this.listcount+=1
                this.addserverlist(new_list)
            }
            else{
                const len = Object.keys(this.lists).length;
                this.listcount = len
                var title1 = 'untitled' + this.listcount
                let lcount = this.listcount
                while(true){
                    const lst = this.lists.find((l) => l.title==title1)
                    if(lst){
                        lcount+=1
                        title1 = 'untitled' + lcount
                        continue
                    }
                    break
                }
                const new_list = {'id': this.listcount, 'title':title1,'cards': []}
                this.lists.push(new_list)
                this.lists_status.pending.push(new_list)
                this.listcount+=1
                this.addserverlist(new_list)
            }
            this.flag=false
        },
        async addserverlist(new_list) {
            const username = localStorage.getItem('name')
            const id = localStorage.getItem('id')
            const jsonobj = JSON.stringify({'username':username,'listname':new_list.title,'userid':id})
            const response = await fetch('http://127.0.0.1:8080/api/list', { 
                method: 'POST', 
                mode: 'cors', 
                credentials: 'same-origin', 
                body: jsonobj, 
                headers: { 'Content-type': 'application/json','Authentication-Token': localStorage.getItem('auth-token')} 
            })
            const body = await response.json()
            if(!response.ok){
                this.lists.pop()
                alert(body.error_message)
            }
            else{
                const info = JSON.parse(body)
                new_list.id=info.id
            }
        },
        async deleteserverlist(id){
            const jsonobj = JSON.stringify({'id':id})
            const response = await fetch('http://127.0.0.1:8080/api/list', { 
                method: 'delete', 
                mode: 'cors', 
                credentials: 'same-origin', 
                body: jsonobj, 
                headers: { 'Content-type': 'application/json','Authentication-Token': localStorage.getItem('auth-token')} 
            })
        },
        deletelist(e){
            if(confirm('Are you sure you want to delete this list?\n\nNote:The cards will be deleted too.')){
                const id = e.target.id
                const list = this.lists.find((l) => l.id==id)
                const ind = this.lists.indexOf(list)
                this.lists.splice(ind, 1)
                this.listdeletecount+=1
                this.deleteserverlist(id)
                if(this.listcount - this.listdeletecount == 0){
                    this.flag = true
                }
            }
        }
        ,
        listcontents(e) {
            const text = e.target.innerText.trim()
            if(text == ''){
                e.target.innerText = 'untitled' + this.listcount
            }
            const duplicate_name = this.lists.find((l)=> l.title==text)
            if(duplicate_name && duplicate_name.id!=e.target.id){
                alert("Duplicate list names are not allowed")
                var title2 = 'untitled' + this.listcount
                let lcount = this.listcount
                while(true){
                    const lst = this.lists.find((l) => l.title==title2)
                    if(lst){
                        lcount += 1
                        title2 = 'untitled' + lcount
                        continue
                    }
                    break
                }
                const list_name = this.lists.find((l) => l.id==e.target.id)
                list_name.title = title2
                this.updatelist(e,title2)
            }
            else{
                const list_name = this.lists.find((l) => l.id==e.target.id)
                if(list_name.title != text){
                    list_name.title = text
                    this.updatelist(e,text)
                }
            }
        },
        async updatelist(e,text){
            const listid = e.target.id;
            const jsonobj = JSON.stringify({'list_id':listid,'listname':text})
            const response = await fetch('http://127.0.0.1:8080/api/list', { 
                method: 'put', 
                mode: 'cors', 
                credentials: 'same-origin', 
                body: jsonobj, 
                headers: { 'Content-type': 'application/json','Authentication-Token': localStorage.getItem('auth-token')} 
            })
            if(!response.ok){
                alert("error")
            }
        },
        updatecard(e){
            const card_id = e.target.parentNode.id
            const name = e.target.nodeName
            for(const i of this.lists){
                var find_card = i.cards.find((c) => c.id==card_id)
                if(find_card){
                    break
                }
            }
            const text = e.target.innerText.trim()
            if(name == 'DIV' && find_card.description!=text){
                this.updateservercard({'id':card_id,'description':text})
            }
            else if(name=='H3' && find_card.title!=text){
                this.updateservercard({'id':card_id,'title':text})
            }
            else if(name=='INPUT' && find_card.deadline!=e.target.value){
                const parts = e.target.value.split("-")
                const d = new Date(parts[0],parts[1]-1,parts[2]).getTime()
                if(String(d).length>13 || !isFinite(d)){
                    alert('invald date',d,this.date)
                    e.target.value = this.date
                }
                this.updateservercard({'id':card_id,'deadline':e.target.value})
            }
            else if(name=="BUTTON" && find_card.status!=text){
                find_card.status = "completed"
                this.updateservercard({'id':card_id,'status':'completed'})
                for(const i of this.lists){
                    const card = i.cards.find((l) => l.id==card_id)
                    if(card)
                        this.$set(card,'completed_on',this.date)
                }
                this.$forceUpdate();
            }
        },
        async updateservercard(obj){
            const response = await fetch('http://127.0.0.1:8080/api/card', { 
                method: 'put', 
                mode: 'cors', 
                credentials: 'same-origin', 
                body: JSON.stringify(obj), 
                headers: { 'Content-type': 'application/json','Authentication-Token': localStorage.getItem('auth-token')} 
            })
            if(!response.ok){
                alert("error")
            }
        },
        addcard(id) {
            const lst = this.lists.find((l) => l.id==id)
            const ind = this.lists.indexOf(lst)
            this.lists[ind].cards.push({'id':this.cardcount,'title':'Untitled'+this.cardcount,'description': 'My new description','deadline':this.date,'status':'pending'})
            this.cardcount+=1
            this.addservercard(id)
        }
        ,
        async addservercard(listid){
            const lst = this.lists.find((l) => l.id==listid)
            const card = lst.cards[lst.cards.length - 1]
            const jsonobj = JSON.stringify({'cardname':card.title,
                'description':card.description,
                'deadline':card.deadline,
                'status':card.status,
                'list_id':listid
            })
            const response = await fetch('http://127.0.0.1:8080/api/card', { 
                method: 'post', 
                mode: 'cors', 
                credentials: 'same-origin', 
                body: jsonobj, 
                headers: { 'Content-type': 'application/json','Authentication-Token': localStorage.getItem('auth-token')} 
            })
            if(!response.ok){
                alert("error")
            }
            else{
                const body = await response.json()
                const info = JSON.parse(body)
                card.id = info.id
            }
        },
        deletecard(listid,cardid,bool) {
            if(bool==false){
                const list = this.lists.find((l) => l.id==listid)
                const card = list.cards.find((c) => c.id==cardid)
                const ind = this.lists.indexOf(list)
                const index = this.lists[ind].cards.indexOf(card)
                this.lists[ind].cards.splice(index,1)
            }
            else if(confirm('Are you sure you want to delete this card?')){
                const list = this.lists.find((l) => l.id==listid)
                const card = list.cards.find((c) => c.id==cardid)
                const ind = this.lists.indexOf(list)
                const index = this.lists[ind].cards.indexOf(card)
                this.lists[ind].cards.splice(index,1)
                this.deleteservercard(card)
            }
        },
        async deleteservercard(card) {
            const id = card.id
            const jsonobj = {'id':id}
            const response = await fetch('http://127.0.0.1:8080/api/card', { 
                method: 'delete', 
                mode: 'cors', 
                credentials: 'same-origin', 
                body: JSON.stringify(jsonobj), 
                headers: { 'Content-type': 'application/json','Authentication-Token': localStorage.getItem('auth-token')} 
            })
            if(!response.ok){
                alert("error")
            }
        },
      }
}

export default board