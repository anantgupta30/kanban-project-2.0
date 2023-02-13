const summary = {
    data() {
        return {
            src: '',
            list_path: '',
            task_obj:''
        }
    },
    template: `
    <div>
        <link rel="stylesheet" href="/static/styles.css">
        <div class="kanban_title" style="margin-top: 20px; margin-left: 30px;">
            <h4>Summary</h4>
            <br>
        </div>
        <h2 style="text-align: center;">Your Progress</h2>
        <div class='dd' style="text-align: center;">
            <ol class="kanban To-do" style="max-width: 5500px;" type="A">
                <h1>Overall</h1><br>
                <img :src="src" class="rounded mx-auto d-block" alt="Wait for the image" width="800" height="450" style="align-self: center;">
            </ol>
        </div>
        <div class='dd' style="text-align: center;">
            <ol class="kanban To-do" style="min-width: fit-content; list-style-type: none; display: flex; flex-direction: row" type="A">
                <h1>By each list</h1><br>
                <li v-for="(path,index) in list_path" :key="index">
                    <img :src="path" class="rounded mx-auto d-block" alt="Wait for the image" width="400" height="400" style="align-self: center; margin-top: 3%;">
                    <div>
                        <p style="color: green;">Completed Tasks: {{ task_obj[index][1]}}/{{task_obj[index].reduce((a,b) => a+b,0) }}</p>
                        <p style="color: darkgoldenrod;">Pending Tasks: {{ task_obj[index][0]}}/{{task_obj[index].reduce((a,b) => a+b,0)  }}</p>
                        <p style="color: red;">Passed deadline: {{ task_obj[index][2]}}/{{task_obj[index].reduce((a,b) => a+b,0) }}</p>
                    </div>
                </li>
            </ol>
        </div>
        <menu class="kanban">
            <button @click.prevent="board"><i class="material-icons">board</i></button>
            <button @click.prevent="logout"><i class="material-icons">logout</i></button>
        </menu>
    </div>
    `,
    async mounted() {
        const response = await fetch(`http://127.0.0.1:8080/api/graph/${localStorage.getItem('id')}`, { 
            method: 'get', 
            mode: 'cors', 
            credentials: 'same-origin', 
            headers: { 'Content-type': 'application/json','Authentication-Token': localStorage.getItem('auth-token')} 
        })
        if(!response.ok){
            alert('error')
        }
        const body = await response.json()
        this.src = JSON.parse(body).path
        this.list_path = JSON.parse(body).listpaths
        this.task_obj = JSON.parse(body).task_lst
    },
    methods: {
        async logout() {
            const res = await fetch('/logout')
            if (res.ok) {
              localStorage.clear()
              this.$router.push('/sign_in')
            } else {
              console.log('could not logout the user')
            }
          },
          board(){
              this.$router.push(`/board/${localStorage.getItem('name')}`)
          },
    }
}


export default summary