  function encodeValue(type, text, endian) {
    const le = endian === "little";
    const s = text.trim();

    if (INT_TYPES[type]) {
      const [size, min, max] = INT_TYPES[type];
      if (!/^[-+]?\d+$/.test(s)) return { err: "enter a whole number" };
      const v = BigInt(s);
      if (v < min || v > max) return { err: "out of range for " + type };
      const u = v < 0n ? v + (1n << BigInt(size * 8)) : v; // two's complement
      const lsbFirst = [];
      for (let i = 0; i < size; i++) lsbFirst.push(Number((u >> BigInt(8 * i)) & 0xffn));
      return { bytes: le ? lsbFirst : lsbFirst.reverse() };
    }

    if (type === "bool") {
      const t = s.toLowerCase();
      if (t === "1" || t === "true") return { bytes: [1] };
      if (t === "0" || t === "false") return { bytes: [0] };
      return { err: "enter true/false or 1/0" };
    }

    if (type === "f32" || type === "f64") {
      if (s === "" || Number.isNaN(Number(s))) return { err: "enter a number" };
      const x = Number(s);
      const buf = new ArrayBuffer(8), dv = new DataView(buf);
      const size = type === "f32" ? 4 : 8;
      if (size === 4) dv.setFloat32(0, x, le); else dv.setFloat64(0, x, le);
      return { bytes: Array.from(new Uint8Array(buf, 0, size)) };
    }

    return { err: "unknown type " + type };
  }

  $("conv").addEventListener("click", () => {
    const res = encodeValue($("type").value, $("val").value, $("endian").value);
    $("convOut").textContent = res.err
      ? res.err
      : res.bytes.map(hexByte).join(" ") + "   (" + $("endian").value + "-endian)";
  });
})();
