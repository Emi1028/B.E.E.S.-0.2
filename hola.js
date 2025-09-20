function erro(contraseña,confirmar) {
    if (contraseña === confirmar) {
        
        const exitoso = window.redirect("exitoso.html");
        
    }
    else {
        alert("La contarseña no coincide");
        return false;
    }
}

function validar(){

    const contraseña = document.getElementById("contraseña").value;
    const confirmar = document.getElementById("confirmar").value;

    const validato = contraseña != null;
    const validato2 = confirmar != null;

    if (validato && validato2) {
        return erro(contraseña,confirmar);
    }
}
document.querySelectorAll('load').forEach(link=> {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const href = this.getAttribute('href');
        if (href !== '#') {
            
        }
})
