const axios = require("axios");

function getBasicUrl(nombreOrg){
    return "https://api.github.com/orgs/" + nombreOrg;
}
axios.defaults.headers.common['Authorization'] = 'Token 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' //para que me permita mas peticiones la api de github

function getRepos(pagina, nombreOrg){
    return "https://api.github.com/orgs/"+ nombreOrg + "/repos?page="+ pagina + "&per_page=100";
}

function getIssuesRepo(repo, nombreOrg){
    return "https://api.github.com/repos/"+ nombreOrg+"/"+ repo +"/issues?state=all&per_page=100";
}

function getCommitsNumber(repo, nombreOrg){
    return "https://api.github.com/repos/"+nombreOrg+"/"+ repo + "/commits?per_page=1";
}


getInfoBasica();

async function getInfoBasica(){

    var nombreOrg = process.argv.slice(2); //gii-is-psg2 , isa-group

    let orgRequest = await axios.get(getBasicUrl(nombreOrg)).catch(error => {console.log(error)}); 
    console.log("\n");
    console.log("   Nombre de la organizacion: ", orgRequest.data.name);
    console.log("   Descripción: ", orgRequest.data.description);
    console.log("   Enlace: ", orgRequest.data.html_url);
    console.log("\n");

    let numRepositorios = orgRequest.data.public_repos;
    //ahora calculo en numero de llamadas que debo hacer teniendo en cuenta que lo maximo a lo que puedo obtener son 100 repos por pagina/llamada
    let numLlamadas = Math.ceil(numRepositorios/100); //math.ceil redondea hacia arriba
    //let numLlamadas = 1;
    console.log("   Numero de llamadas a repos: ", numLlamadas);
    
    let n = 0;
    let totalIssues = 0;
    let totalCommits = 0;
    for (var pagina = 1; pagina <= numLlamadas; pagina++){
      let repoRequest = await axios.get(getRepos(pagina, nombreOrg)).catch(error => {console.log(error)});
      for(repo in repoRequest.data){
            n = n +1;
            console.log("       ->",repoRequest.data[repo].name);
            console.log("           Issues Abiertas: ", repoRequest.data[repo].open_issues); //el numero es un parametro del repo

            let issuesRequest = await axios.get(getIssuesRepo(repoRequest.data[repo].name, nombreOrg)).catch(error => {console.log(error)});

            if(typeof issuesRequest.data[0] !== "undefined"){
                let issuesEsteRepo = issuesRequest.data[0].number; //en la primera issue te sale el numero de la ultima issue creada, asi es posible saber cuantas ha habido
                console.log("           Issues Totales: ", issuesEsteRepo); 
                totalIssues = totalIssues + issuesEsteRepo;
                
            }
            let commitRequest= await axios.get(getCommitsNumber(repoRequest.data[repo].name, nombreOrg)).catch(error => {console.log(error)});
            
            let numCommits = commitRequest.headers.link.match(/[0-9]+>; rel="last"/); //cogemos la ultima pagina de comits para obtener el numero de commits, ya que hay un commit por pagina
            //numCommits es una lista que tiene como elemento [0] el match de la expresion regular, y el resto de elementos son informacion de donde la ha encontrado etc
            numCommits = parseInt(numCommits[0].match(/[0-9]+/)); //ahora le ponemos otra expresion regular para coger simplemente el numero de paginas

            console.log("           Commits: ", numCommits); 
            totalCommits = totalCommits + numCommits;

      }
    }

    console.log("   Issues de TODOS los repositorios: ", totalIssues);
    console.log("   Commits de TODOS los repositorios: ", totalCommits);
    console.log("   repos publicos obtenidos: ", n);
}
