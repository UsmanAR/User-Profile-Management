function validator(){
    document.getElementById("warning").style.display="none";
    var passwd=document.getElementById("passwd").value;
    var conf_pass =  document.getElementById("conf_passwd").value;
    if(conf_pass!=passwd){
        document.getElementById("warning").style.display="block";
    }
    else{
       document.getElementById("warning").style.display="none";
    }
}