const core =  require('@actions/core');
const github = require('@actions/github');

function main(){
    try {
        // take the input to the action
        const files = core.getInput('files');
        
        // time of the action
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);


        console.log(files);
    }
    catch (error){
        core.setFailed(error.message);
    }
}

main();