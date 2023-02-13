const login = {
  data: function() {
      return {
        email: '',
        pass: '',
        invalidemail: false,
        invalidpassword: false 
      }
  },
  template: `
  <section class="vh-100" style="background-color: #eee;">
      <div class="container h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col-lg-12 col-xl-11">
            <div class="card text-black" style="border-radius: 25px;">
              <div class="card-body p-md-5">
              <h1 style="text-align: center;">Kanban Application</h1>
                <div class="row justify-content-center">
                  <div class="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
    
                    <p class="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign in</p>
    
                    <form class="mx-1 mx-md-4" id="loginform" action="">
    
                      <div class="d-flex flex-row align-items-center mb-4">
                        <i class="fas fa-user fa-lg me-3 fa-fw"></i>
                        <div class="flex-fill mb-0">
                        <input v-model="email" type="email" id="form3Example2c" :class="{'form-control':true,'is-invalid':invalidemail}" placeholder="Your email" aria-describedby="validationServer01Feedback" required />
                          <div id="validationServer01Feedback" class="invalid-feedback">
                            {{ email }}
                          </div> 
                        </div>
                      </div>
    
                      <div class="d-flex flex-row align-items-center mb-4">
                        <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                        <div class="flex-fill mb-0">
                          <input v-model="pass" placeholder="Password" type="password" id="form3Example3c" :class="{'form-control':true,'is-invalid':invalidpassword}" aria-describedby="validation02serverfeedback" required/>
                          <div id="validationServer02Feedback" class="invalid-feedback">
                            {{ pass }}
                          </div> 
                        </div>
                      </div>
    
                      <div class="form-check d-flex justify-content-center mb-5">
                          <p>Doesn't have a account? <a href="/#/sign_up">Sign up now</a></p>
                      </div>
    
                      <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                        <button @click.prevent="formsubmit" id="registerbtn" class="btn btn-primary btn-lg">Login</button>
                      </div>
    
                      </form>
    
                  </div>
                  <div class="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
    
                    <img src="./static/kanban_tool.jpg"class="img-fluid" alt="Sample image">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  beforeCreate() {
    if(localStorage.getItem('auth-token')){
      const name = localStorage.getItem('name')
      this.$router.push('/board/'+name)
    }
  },
  methods: {
    formsubmit: async function(){
      this.invalidemail = false
      this.invalidpassword = false
      const data1 = {
        'email': this.email,
        'password': this.pass
      }
      const res = await fetch('/login?include_auth_token',{method: 'post', 
      headers: {'Content-Type': 'application/json'},body: JSON.stringify(data1)
    })
    const body = await res.json()
      if(!res.ok){
        const error = body.response.errors
          if('email' in error){
              this.email = error.email[0]
              this.invalidemail = true}
          if('password' in error){
              this.pass = error.password[0]
              this.invalidpassword = true }
              return false
          }
      else{
            this.invalidemail = false
            this.invalidpassword = false
            const token = body.response.user.authentication_token
            localStorage.setItem('auth-token',token)
            const res = await fetch(`/api/user`, {method: 'post',body: JSON.stringify(data1),
      headers: {
        'Content-Type': 'application/json',
        'Authentication-Token': localStorage.getItem('auth-token'),
      },
    })
    const info = await res.json()
    const obj = JSON.parse(info)
    localStorage.setItem('name',obj.name)
    localStorage.setItem('id',obj.id)
    this.$router.push('/board/'+obj.name)
          }
    }
  },
}

export default login