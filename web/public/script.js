var navNum;
var f_num;

//どのnavが選択されているか
function navSelect(num){
    navNum = num;

    var $n1 = document.getElementById("navi1");
    var $n2 = document.getElementById("navi2");
    var $n3 = document.getElementById("navi3");

    if(navNum==1){
        //console.log("nav1が選択されています");
        $n1.style.borderBottom = "7px solid #FED500";
        $n2.style.borderBottom = "7px solid white";
        $n3.style.borderBottom = "7px solid white";
        document.getElementById("section1").style.display ="block";
        document.getElementById("section2").style.display ="none";
        document.getElementById("section3").style.display ="none";
    }else if(navNum==2){
        //console.log("nav2が選択されています");
        $n1.style.borderBottom = "7px solid white";
        $n2.style.borderBottom = "7px solid #FED500";
        $n3.style.borderBottom = "7px solid white";
        document.getElementById("section1").style.display ="none";
        document.getElementById("section2").style.display ="block";
        document.getElementById("section3").style.display ="none";
    }else if(navNum==3){
        //console.log("nav3が選択されています");
        $n1.style.borderBottom = "7px solid white";
        $n2.style.borderBottom = "7px solid white";
        $n3.style.borderBottom = "7px solid #FED500";
        document.getElementById("section1").style.display ="none";
        document.getElementById("section2").style.display ="none";
        document.getElementById("section3").style.display ="block";
    }else{
        console.log("適切な処理がされていません");
    }
}

function footerSelect(fnum){
    f_num = fnum;

    var $f1 = document.getElementById("footer1");
    var $f2 = document.getElementById("footer2");

    if(f_num==0){
        $f1.style.background = "#DE6C31";
        $f2.style.background = "#989898";
        document.getElementById("design").style.display ="block";
        document.getElementById("history").style.display ="none";
        document.getElementById("header_nav").style.display ="block";
    } else if(f_num==1){
        $f1.style.background = "#989898";
        $f2.style.background = "#008542";
        document.getElementById("design").style.display ="none";
        document.getElementById("history").style.display ="block";
        document.getElementById("header_nav").style.display ="none";
    }else{
        console.log("適切な処理がされていません");
    }
}