function ex2( ){
    let x = document.getElementById('ex2_i').value;
    let resposta = " ";
    for(let i= 0; i <=  x; i++){
        resposta += " " + i;
    }

    document.getElementById("r2").innerHTML = resposta;
}
