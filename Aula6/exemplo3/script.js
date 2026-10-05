function soma(a, b){
    return a + b ;
}
   

function ex3( ){
    let a = parseInt(document.getElementById("ex3_a").value);
    let b = parseInt(document.getElementById("ex3_b").value);

    let c= soma(a, b);

    document.getElementById("r3").innerHTML= c;
}