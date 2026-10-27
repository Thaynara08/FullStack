function mult(a,b){
    return a * b
}
function soma(a, b){
    return a + b ;
}

function ex4( ){
    let a = parseInt(document.getElementById("ex4_a").value);
    let b = parseInt(document.getElementById("ex4_b").value);
    
    let c;
    if (a<0 || b < 0){
        c= soma(a, b);
    }else{
        c = mult(a, b);
    }

    document.getElementById("r4").innerHTML= c;
}