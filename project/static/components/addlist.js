
const addlist = {
    template: `
    <div class="Container">
        <link rel="stylesheet" href="/static/styles.css">
        <div class="Container" style="margin-top: 20px; margin-left: 30px;">
            <h4>Hello {{ get_name() }}</h4>
        </div>
        <div class="'Container" style="text-align: center; font-size: larger; font-weight: 700; margin-top: 20px; margin-bottom: 5%;">
            Add a list
        </div>
        <div class="col" style="text-align: center;">
            <form id="userform" action="/addlist" method="post">
                <label for="name" style="margin-right: 20px;">Name:   </label>
                <input onkeydown="return /[a-z,\s]/i.test(event.key)" id="name" name="name" style=" vertical-align: middle; text-align: center; width: 25%; height: 10%;" required><br>
                <label style="margin-right: 20px; text-align: center; vertical-align: middle;" for="description">Description:   </label>
                <textarea onkeydown="return /[a-z,0-9,\s]/i.test(event.key)" id="description" rows="4" cols="50" name="description" form="userform" style="margin-top: 5%; margin-right: 40px;  vertical-align: middle; text-align: center;"></textarea><br>
                <button class="button" type="submit" value="submit">submit</button>
            </form>
        </div>
    </div>
    `,
    methods: {
        get_name() {
            return localStorage.getItem('name')
        }
    },
}
export default addlist