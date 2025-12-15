let map;
let marker;

// Cek apakah input adalah IP
function isIP(input) {
    const ipRegex =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    return ipRegex.test(input);
}

async function trackIP() {
    const inputRaw = document.getElementById("input").value.trim();
    const result = document.getElementById("result");

    if (!inputRaw) {
        alert("Masukkan IP atau URL!");
        return;
    }

    let ip = "";

    try {
        // =====================
        // JIKA INPUT IP
        // =====================
        if (isIP(inputRaw)) {
            ip = inputRaw;
        }
        // =====================
        // JIKA INPUT URL / DOMAIN
        // =====================
        else {
            const domain = inputRaw
                .replace("https://", "")
                .replace("http://", "")
                .split("/")[0];

            const dnsRes = await fetch(
                `https://dns.google/resolve?name=${domain}&type=A`
            );
            const dnsData = await dnsRes.json();

            if (!dnsData.Answer) {
                alert("IP tidak ditemukan dari domain");
                return;
            }

            ip = dnsData.Answer[0].data;
        }

        // =====================
        // GEO IP
        // =====================
        const geoRes = await fetch(`https://ipwho.is/${ip}`);
        const data = await geoRes.json();

        if (!data.success) {
            alert("Gagal melacak IP");
            return;
        }

        document.getElementById("ip").innerText = ip;
        document.getElementById("city").innerText = data.city || "-";
        document.getElementById("region").innerText = data.region || "-";
        document.getElementById("country").innerText = data.country || "-";
        document.getElementById("isp").innerText =
            data.connection?.isp || "-";
        document.getElementById("org").innerText =
            data.connection?.org || "-";
        document.getElementById("lat").innerText = data.latitude;
        document.getElementById("lon").innerText = data.longitude;

        result.style.display = "block";

        // =====================
        // MAP
        // =====================
        if (!map) {
            map = L.map("map").setView(
                [data.latitude, data.longitude],
                10
            );

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                { attribution: "© OpenStreetMap" }
            ).addTo(map);
        } else {
            map.setView([data.latitude, data.longitude], 10);
        }

        if (marker) marker.remove();

        marker = L.marker([data.latitude, data.longitude])
            .addTo(map)
            .bindPopup(
                `<b>${data.city || "Unknown"}</b><br>${ip}<br>${data.connection?.isp || ""}`
            )
            .openPopup();

    } catch (err) {
        alert("Terjadi kesalahan! Periksa input atau koneksi.");
        console.error(err);
    }
}
