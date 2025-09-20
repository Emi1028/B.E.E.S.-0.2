function erro(form) {
    let contraseña = form.contraseña;
    let confirmar = form.confirmar;

    const pass1 = (confirmar || "").trim();

    if (contraseña === pass1) {
        res.redirect('/exitoso.html');
    }
    else {
        res.redirect('/registro.html?error=Las%20contrase%C3%B1as%20no%20coinciden');
    }
}