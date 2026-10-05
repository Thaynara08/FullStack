let n= Math.floor(Math.random()*100)

function lab(){

    let b = document.getElementById("lab").value

    if (b>n){
    document.getElementById("resposta").innerHTML= "Número grande!"
   
    } else if (b<n){
    document.getElementById("resposta").innerHTML = "Número pequeno!"

    }else{
    document.getElementById("resposta").innerHTML = "Você acertou!"
    }
    console.log(n)
}