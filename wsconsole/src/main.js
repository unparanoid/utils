window.addEventListener("DOMContentLoaded", () => {
  const E = {
    conn: {
      addr:   document.querySelector("#conn .addr"),
      status: document.querySelector("#conn .status"),
      mode:   document.querySelector("#conn .mode"),
      submit: document.querySelector("#conn .submit"),
    },
    terminal: {
      list:   document.querySelector("#terminal .list"),
      input:  document.querySelector("#terminal .input"),
      status: document.querySelector("#terminal .status"),
      submit: document.querySelector("#terminal .submit"),
    },
  };

  const C = {
    sock: null,
    addr: "",
    mode: "",
  };

  const F = {
    connect: () => {
      F.freeze();

      C.addr = F.util.buildWsockPath(E.conn.addr.value);
      C.mode = E.conn.mode.value;

      E.conn.addr.value = C.addr;
      E.conn.status.innerText = "connecting...";
      F.log.sysinfo("connecting to "+C.addr+" with "+C.mode+" mode");

      C.sock = new WebSocket(C.addr);
      C.sock.addEventListener("open", () => {
        E.conn.status.innerText = "connection established";
        F.log.sysinfo("connection established");
        F.unfreeze();
        F.open();
      });
      C.sock.addEventListener("message", async (e) => {
        switch (C.mode) {
          case "plaintext":
            F.log.outputTxt(await e.data.text());
            break;

          case "msgpack":
            const buf = await e.data.arrayBuffer();
            try {
              const obj = msgpack.decode(new Uint8Array(buf));
              F.log.outputObj(obj);
            } catch (ex) {
              console.log(ex);
              F.log.syswarn("message received but failed to parse as msgpack");
            }
            break;

          default:
            F.log.syswarn("unknown mode: "+C.mode);
        }
      });
      C.sock.addEventListener("error", (e) => {
        F.log.syswarn("WebSocket error");
      });
      C.sock.addEventListener("close", () => {
        E.conn.status.innerText = "connection closed";
        F.log.sysinfo("connection closed");
        F.unfreeze();
        F.close();
      });
    },
    freeze: () => {
      E.conn.addr  .disabled = true;
      E.conn.submit.disabled = true;
    },
    unfreeze: () => {
      E.conn.addr  .disabled = false;
      E.conn.submit.disabled = false;
    },

    open: () => {
      E.terminal.input .disabled = false;
      E.terminal.submit.disabled = false;
    },
    close: () => {
      E.terminal.input .disabled = true;
      E.terminal.submit.disabled = true;
    },
    send: () => {
      switch (C.mode) {
      case "plaintext":
        F.log.inputTxt(E.terminal.input.value);
        C.sock.send(E.terminal.input.value);
        break;

      case "msgpack":
        try {
          const obj = JSON.parse(E.terminal.input.value);
          F.log.inputObj(obj);
          C.sock.send(msgpack.encode(obj));
          E.terminal.status.innerText = "sent :3";
        } catch (ex) {
          E.terminal.status.innerText = "failed to send X(";
        }
        break;

      default:
        E.terminal.status.innerText = "unknown mode: "+C.mode;
      }
    },

    log: {
      sysinfo: (str) => {
        F.log.add("INFO", str, "sysinfo");
      },
      syswarn: (str) => {
        F.log.add("WARN", str, "syswarn");
      },
      inputTxt: (str) => {
        F.log.add("<TXT", str);
      },
      outputTxt: (str) => {
        F.log.add(">TXT", str);
      },
      inputObj: (obj) => {
        F.log.add("<OBJ", JSON.stringify(obj));
      },
      outputObj: (obj) => {
        F.log.add(">OBJ", JSON.stringify(obj));
      },
      add: (prefix, str, class_) => {
        const item = document.createElement("li");
        if (class_) {
          item.classList.add(class_);
        }
        prefix += ": ";
        item.innerText = prefix+str.replace(/\n/g, "\n"+prefix);

        E.terminal.list.appendChild(item);
        E.terminal.list.scrollTop = E.terminal.list.scrollHeight;
      },
    },

    util: {
      buildWsockPath: (src) => {
        return src.match("^ws://")? src: "ws://"+window.location.host+"/"+src;
      },
    },
  };

  E.conn.submit.addEventListener("click", F.connect);
  E.conn.addr  .addEventListener("keydown", (e) => {
    if ((e.keyCode || e.charCode || 0) == 13) {  /* enter */
      F.connect();
      e.preventDefault();
    }
  });

  E.terminal.submit.addEventListener("click", F.send);
  E.terminal.input .addEventListener("keydown", (e) => {
    if ((e.keyCode || e.charCode || 0) == 13 && e.ctrlKey) {  /* ctrl+enter */
      F.send();
      e.preventDefault();
    }
  });
  F.close();
});
