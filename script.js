(function() {

    var fields = {
        name: document.getElementById("name"),
        role: document.getElementById("role"),
        phone: document.getElementById("phone"),
        email: document.getElementById("email"),
        address: document.getElementById("address")
    };

    var DIRECCION_FIJA = "Calle Antequera 777, San Isidro - Lima";

    var cells = {
        name1: document.getElementById("name-1"),
        role1: document.getElementById("role-1"),
        phone1: document.getElementById("phone-1"),
        email1: document.getElementById("email-1"),
        address1: document.getElementById("address-1")
    };

    var qrContainer1 = document.getElementById("qr-container-1");
    var QR_SIZE = 170;
    var updateTimeout = null;
    var currentQR = null;

    // Función para formatear a título respetando tildes
    function formatTitleCase(str) {
        if (!str) return str;
        
        // Separar la cadena en palabras
        return str.toLowerCase().split(' ').map(function(word) {
            if (word.length === 0) return word;
            // Primera letra en mayúscula, el resto en minúscula (respetando tildes)
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    function formatPhoneNumber(phone) {
        var cleanPhone = phone.replace(/[^0-9+]/g, "");
        
        if (cleanPhone && !cleanPhone.startsWith('+')) {
            if (cleanPhone.length === 9) {
                cleanPhone = '+51' + cleanPhone;
            }
            else if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
                cleanPhone = '+51' + cleanPhone;
            }
        }
        
        return cleanPhone;
    }

    function generateVCard() {
        var name = fields.name.value.trim() || "Telrad Perú S.A.";
        var role = fields.role.value.trim();
        var phone = fields.phone.value.trim();
        var email = fields.email.value.trim();
        var address = fields.address.value.trim() || DIRECCION_FIJA;
        
        var cleanPhone = formatPhoneNumber(phone);
        
        var formattedName = formatTitleCase(name);
        var formattedRole = role ? formatTitleCase(role) : "";
        
        var vcardLines = [];
        
        vcardLines.push("BEGIN:VCARD");
        vcardLines.push("VERSION:3.0");
        vcardLines.push("FN:" + formattedName);
        
        var nameParts = formattedName.trim().split(/\s+/);
        var lastName = nameParts.pop() || "";
        var firstName = nameParts.join(" ") || "";
        vcardLines.push("N:" + lastName + ";" + firstName + ";;;");
        
        if (formattedRole) {
            vcardLines.push("TITLE:" + formattedRole);
        }
        
        vcardLines.push("ORG:Telrad Perú S.A.");
        
        if (cleanPhone) {
            vcardLines.push("TEL;TYPE=WORK,VOICE:" + cleanPhone);
        }
        
        if (email) {
            vcardLines.push("EMAIL;TYPE=WORK:" + email);
        }
        
        vcardLines.push("ADR;TYPE=WORK:;;" + address + ";;Lima;Perú;");
        
        vcardLines.push("URL:https://www.telrad.com.pe");
        
        vcardLines.push("END:VCARD");
        
        return vcardLines.join("\r\n");
    }

    function generateSimpleQR() {
        if (!qrContainer1) return;
        
        try {
            const vcard = generateVCard();
            
            if (currentQR) {
                qrContainer1.innerHTML = '';
            }
            
            currentQR = new QRCodeStyling({
                width: QR_SIZE,
                height: QR_SIZE,
                type: "canvas",
                data: vcard,
                qrOptions: {
                    errorCorrectionLevel: "M"
                },
                dotsOptions: {
                    color: "#136899",
                    type: "rounded"
                },
                backgroundOptions: {
                    color: "#ffffff"
                },
                cornersSquareOptions: {
                    type: "extra-rounded",
                    color: "#136899"
                },
                margin: 4
            });
            
            currentQR.append(qrContainer1);
            
        } catch (error) {
            console.error("Error generando QR:", error);
            qrContainer1.innerHTML = '<div style="width:170px;height:170px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;border:1px solid #ccc;">Error QR</div>';
        }
    }

    function updateTexts() {
        // NOMBRE - formateado a título
        if (cells.name1) {
            var nameText = fields.name.value.trim();
            if (nameText) {
                nameText = formatTitleCase(nameText);
            } else {
                nameText = "[Nombre y Apellido]";
            }
            cells.name1.innerHTML = nameText;
        }
        
        // CARGO - formateado a título
        if (cells.role1) {
            var roleText = fields.role.value.trim();
            if (roleText) {
                roleText = formatTitleCase(roleText);
            } else {
                roleText = "";
            }
            cells.role1.innerHTML = roleText;
        }
        
        if (cells.phone1) {
            cells.phone1.innerHTML = fields.phone.value.trim() || "[Número]";
        }
        
        if (cells.email1) {
            cells.email1.innerHTML = fields.email.value.trim() || "[Correo]";
        }
        
        if (cells.address1) {
            cells.address1.innerHTML = fields.address.value.trim() || DIRECCION_FIJA;
        }
        
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(generateSimpleQR, 300);
    }

    var downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", function() {
            var element = document.getElementById("export-wrapper");
            if (element && html2canvas) {
                downloadBtn.disabled = true;
                downloadBtn.textContent = "Generando imagen...";
                
                var width = element.scrollWidth;
                var height = element.scrollHeight;
                
                html2canvas(element, {
                    scale: 2,
                    backgroundColor: "#ffffff",
                    logging: false,
                    useCORS: true,
                    allowTaint: false,
                    width: width,
                    height: height,
                    windowWidth: width,
                    windowHeight: height
                }).then(function(canvas) {
                    var link = document.createElement("a");
                    var timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
                    link.download = "firma_telrad_" + timestamp + ".jpg";
                    link.href = canvas.toDataURL("image/jpeg", 0.95);
                    link.click();
                }).catch(function(error) {
                    console.error("Error:", error);
                    alert("Error al generar la imagen: " + error.message);
                }).finally(function() {
                    downloadBtn.disabled = false;
                    downloadBtn.textContent = "Descargar Firma (.JPG)";
                });
            } else {
                alert("Error: No se puede generar la imagen");
            }
        });
    }

    if (fields.name) fields.name.addEventListener("input", updateTexts);
    if (fields.role) fields.role.addEventListener("input", updateTexts);
    if (fields.phone) fields.phone.addEventListener("input", updateTexts);
    if (fields.email) fields.email.addEventListener("input", updateTexts);
    if (fields.address) fields.address.addEventListener("input", updateTexts);
    
    setTimeout(function() {
        updateTexts();
    }, 200);

})();
