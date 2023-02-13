const register = {
    data: function() {
        return {
            errors: [],
            invalidemail: false,
            invalidpass: '',
            invalidrepeatpass: '',
            displayobj: {
                display: 'block'
            },
            pass: "",
            confirm_pass: "",
            strength: {
                uppercase: false,
                lowercase: false,
                digit: false,
                len: false
              },
            pass_seen: false,
            con_pass: false,
            strengthlevel: 0,
            colors: "",
            match_color: "red",
            sub: ""
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
      
                      <p class="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>
      
                      <form class="mx-1 mx-md-4" id="registerform" @submit="checkform" :style="displayobj" >
      
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-user fa-lg me-3 fa-fw"></i>
                          <div class="flex-fill mb-0">
                            <input type="text" name="name" id="form3Example1c" placeholder='Your Name' class="form-control" required />
                          </div>
                        </div>
      
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
                          <div class="flex-fill mb-0">
                            <input type="email" id="form3Example2c" :class="{'form-control':true,'is-invalid':invalidemail}" placeholder="Your email" aria-describedby="validationServer001Feedback" required />
                            <div id="validationServer001Feedback" class="invalid-feedback">
                              Email already exists. Please login.
                            </div>  
                          </div>
                        </div>
      
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                          <div class="flex-fill mb-0">
                            <input @focus="pass_seen = true" @blur="pass_seen = false" v-model:value="pass" placeholder="Password" type="password" id="form3Example3c validate" :class="{'form-control': true, 'is-invalid':invalidpass}" aria-describedby="validationServer03Feedback" required/>
                            <div id="validationServer03Feedback" class="invalid-feedback">
                              Please provide a valid password.
                            </div>
                          </div>
                        </div>
      
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-key fa-lg me-3 fa-fw"></i>
                          <div class="flex-fill mb-0">
                            <input @focus="con_pass=true" @blur="con_pass = false" v-model:value="confirm_pass" placeholder="Repeat your password" type="password" id="form3Example4d" :class="{'form-control': true, 'is-invalid':invalidrepeatpass}" aria-describedby="validationServer04Feedback" required /><div v-show="con_pass"></div>
                            <div id="validationServer04Feedback" class="invalid-feedback">
                              Please repeat the same password.
                            </div>
                          </div>
                        </div>
      
                        <div class="form-check d-flex justify-content-center mb-5">
                           <p> Already have a account? <a href="/#/sign_in">Sign in</a></p>
                        </div>
      
                        <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                          <button type="submit" id="registerbtn" class="btn btn-primary btn-lg">Register</button>
                        </div>
      
                        </form>
      
                    </div>
                    <div class="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
      
                      <img src="./static/kanban_tool.jpg"
                        class="img-fluid" alt="Sample image">
      
                    </div>
                  </div>
                  <div v-show="pass_seen" id="validate" style="text-align: center;">
                    <h3>Password must contain:</h3>
                    <div class="Cotainer" style="position: relative;">
                        <p id="letter" :class="{invalid : !this.strength.lowercase, valid: this.strength.lowercase}">A <b>lowercase</b> letter</p>
                        <p id="capital" :class="{invalid : !this.strength.uppercase, valid: this.strength.uppercase}">A <b>uppercase</b> letter</p>
                        <p id="number" :class="{invalid : !this.strength.digit, valid: this.strength.digit}">At least a <b>number</b></p>
                        <p id="length" :class="{invalid : !this.strength.len, valid: this.strength.len}">Min  <b>7 characters</b></p>
                    </div>
                    </div>
                    <div style="text-align: center; background-color: lightpink;">
                        <p v-if="errors.length">
                            <b>Please correct the following:</b>
                            <p v-for="error in errors">{{error}}</p>
                        </p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    methods:{
        checkform: async function(e) {
          e.preventDefault();
            this.errors = []
            if(this.strengthlevel == 4){
                if(this.invalidpass == false && this.invalidrepeatpass == false){
                  const obj = {
                    'username': document.forms['registerform'].getElementsByTagName('input').form3Example1c.value,
                    'email': document.forms['registerform'].getElementsByTagName('input').form3Example2c.value,
                    'password': document.forms['registerform'].getElementsByTagName('input').form3Example4d.value
                  }
                  const response = await fetch('/api/register', { method: 'POST', mode: 'cors', credentials: 'same-origin', body: JSON.stringify(obj), headers: { 'Content-type': 'application/json' } }).then((response) => response.json()).then(data =>{ return(data)})
                  console.log(response)
                  if(response=='registered'){
                    alert('registered successfullly')
                    window.location.href = '/#/sign_in'
                  }
                  else{
                    this.invalidemail = true
                  }
                }
                else {
                    this.errors.push("Password should match")
                }
            }
            else{
                for(i in this.strength){
                    if(!this.strength[i]){
                        console.log(i)
                        switch(i) {
                            case 'uppercase':
                                this.errors.push('Password should contain at least a uppercase letter');
                                break
                            case 'lowercase':
                                this.errors.push('Password should contain at least a lowercase letter');
                                break
                            case 'digit':
                                this.errors.push('Password should contain at least a digit letter');
                                break
                            case 'len':
                                this.errors.push("Password length should be at least 7")
                                break
                        }
                    }
                }
            }
        }
    },
    watch:{
        pass: function(new_pass){
            this.pass_seen = true
            if(new_pass == ''){
                this.template = '';
                this.pass_seen = false
            }
            this.strength.len = new_pass.length > 6;
            this.strength.uppercase = new_pass.toLowerCase() != new_pass;
            this.strength.lowercase = new_pass.toUpperCase() != new_pass;
            this.strength.digit = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].some((digit) => new_pass.includes(digit))
            this.strengthlevel = Object.values(this.strength).reduce((a, b) => a + b, 0)
            if(this.strengthlevel != 4)
              this.invalidpass = true;
            else
             this.invalidpass = false;
        },
        confirm_pass: function(new_confirm_pass){
            if(new_confirm_pass != this.pass ){
                this.invalidrepeatpass = true;
            }
            else {
                this.invalidrepeatpass = false;
            }
        }
    }
}

export default register