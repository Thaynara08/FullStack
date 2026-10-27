let n= Math.floor(Math.random()*100)

function lab(){

    let b = document.getElementById("lab").value

    if (b>n){
    document.getElementById("resposta").innerHTML= "Número grande!"
    document.getElementById("resposta").style.setProperty("background-color", "red")
   
    } else if (b<n){
    document.getElementById("resposta").innerHTML = "Número pequeno!"
    document.getElementById("resposta").style.setProperty("background-color", "red")

    }else{
    document.getElementById("resposta").innerHTML = "Você acertou!"
    document.getElementById("resposta").style.setProperty("background-color", "green")
    }
    console.log(n)
}