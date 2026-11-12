// ===== Registro Florecer en Gratitud: configuración compartida =====
// Los registros se guardan en Jotform, formulario "Registro Florecer en Gratitud".
// Consulta: jotform.com > Mis formularios > Registro Florecer en Gratitud > Tabla.
const FG = {
  STRIPE_LINK: "https://book.stripe.com/00w8wQ0gxgwQ3NuaSGenS0n",
  JOTFORM_ID: "263148108888064",
  ZELLE: "201-679-9969",
  WHATSAPP: "12016799969",
  // Campo de la página -> campo de Jotform
  F: {
    tipo: "q2_tipo_de_registro", ref: "q3_referencia", nombre: "q4_nombre_y_apellido", telefono: "q5_whatsapp",
    email: "q6_correo_electr__nico", invitada: "q7_nombre_de_la_invitada", alergias: "q8_alergias_o_restricciones",
    fotos: "q9_autoriza_fotos_y_videos", estado: "q10_estado_de_pago", metodo: "q11_m__todo_de_pago",
    negocio: "q12_tiene_negocio", proyecto: "q13_nombre_del_proyecto", dedica: "q14_a_qu___se_dedica",
    redes: "q15_web_o_redes", presentar: "q16_quiere_presentarlo_en_florecer_juntas", compartir: "q17_trae_algo_para_compartir"
  }
};

// Envía una fila a Jotform. Devuelve una promesa que se resuelve aunque la red falle (no bloquea a la persona).
FG.save = function (data) {
  const body = new URLSearchParams();
  body.set("formID", FG.JOTFORM_ID);
  body.set("simple_spc", FG.JOTFORM_ID + "-" + FG.JOTFORM_ID);
  body.set("website", "");
  for (const k in data) if (FG.F[k] && data[k] != null) body.set(FG.F[k], String(data[k]));
  const send = fetch("https://submit.jotform.com/submit/" + FG.JOTFORM_ID + "/", { method: "POST", mode: "no-cors", body, keepalive: true })
    .catch(() => {});
  return Promise.race([send, new Promise(r => setTimeout(r, 4000))]);
};

FG.newRef = function () {
  return "FG-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
};

FG.remember = function (r) { try { localStorage.setItem("fg-registro", JSON.stringify(r)); } catch (_) {} };
FG.recall = function () { try { return JSON.parse(localStorage.getItem("fg-registro") || "null"); } catch (_) { return null; } };

// Paso opcional (parte C): se pinta dentro de un contenedor.
FG.renderOptional = function (box) {
  box.innerHTML = `
  <div class="opt-step">
    <h3>¿Tienes un negocio o emprendimiento?</h3>
    <p class="opt-sub">Es opcional. Nos ayuda a preparar la cena.</p>
    <div class="yesno">
      <button type="button" class="btn ghost" data-v="Sí">Sí</button>
      <button type="button" class="btn ghost" data-v="No">No</button>
    </div>
    <div class="opt-cards" hidden>
      <form class="opt-card" novalidate>
        <div class="opt-tag">Incluido en tu entrada</div>
        <h4>Florecer juntas</h4>
        <p>Todas las asistentes con un emprendimiento tienen este espacio. Durante la cena presentas tu proyecto. Si quieres, también puedes traer algo para compartir ese día.</p>
        <label>Nombre del proyecto<input name="proyecto" required></label>
        <label>¿A qué te dedicas?<textarea name="dedica" required></textarea></label>
        <label>Web o redes <span class="opt">(opcional)</span><input name="redes" placeholder="@tuemprendimiento o www.tupagina.com"></label>
        <label class="choice"><input type="checkbox" name="presentar" value="Sí"> Quiero presentarlo</label>
        <label>¿Traes algo para compartir?
          <select name="compartir">
            <option>No esta vez</option><option>Comida</option><option>Bebidas</option><option>Flores o decoración</option><option>Otra cosa</option>
          </select>
        </label>
        <button class="btn block" type="submit">Guardar mi proyecto</button>
        <p class="fine opt-msg" role="status"></p>
      </form>
      <div class="opt-card sponsor">
        <div class="opt-tag">Alianza comercial con la marca</div>
        <h4>Sponsor</h4>
        <p>Es un acuerdo comercial con Mindful Wellness: tu marca recibe visibilidad en el evento, los impresos y las redes, en este evento y los que vienen.</p>
        <a class="btn block" href="sponsors.html">Ver el plan de sponsors</a>
      </div>
    </div>
    <p class="fine opt-done" hidden>Gracias. Te esperamos el sábado 21.</p>
  </div>`;
  const reg = FG.recall() || {};
  const cards = box.querySelector(".opt-cards"), done = box.querySelector(".opt-done");
  box.querySelectorAll(".yesno .btn").forEach(b => b.addEventListener("click", () => {
    box.querySelectorAll(".yesno .btn").forEach(x => x.classList.toggle("on", x === b));
    const yes = b.dataset.v === "Sí";
    cards.hidden = !yes; done.hidden = yes;
    if (!yes) FG.save({ tipo: "Paso opcional", ref: reg.ref, nombre: reg.nombre, email: reg.email, negocio: "No" });
  }));
  const f = box.querySelector("form.opt-card");
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const msg = f.querySelector(".opt-msg");
    const bad = [...f.querySelectorAll("[required]")].find(el => !el.value.trim());
    if (bad) { msg.textContent = "Escribe el nombre de tu proyecto y a qué te dedicas."; bad.focus(); return; }
    const fd = new FormData(f);
    msg.textContent = "Guardando…";
    await FG.save({
      tipo: "Paso opcional", ref: reg.ref, nombre: reg.nombre, email: reg.email, negocio: "Sí",
      proyecto: fd.get("proyecto"), dedica: fd.get("dedica"), redes: fd.get("redes"),
      presentar: fd.get("presentar") ? "Sí" : "No", compartir: fd.get("compartir")
    });
    msg.textContent = "Listo, guardamos tu proyecto. Te esperamos el sábado 21.";
    f.querySelector("button[type=submit]").disabled = true;
  });
};
