MathJax.Hub.Config({
  showProcessingMessages: false,
  tex2jax: {
    inlineMath: [['$','$']],
    ignoreClass: ".*",
    processClass: "mathjax"
  },
  TeX: {
    equationNumbers: {
      autoNumber: "AMS"
    }
  }
});

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  }
});

var Preview = {
  delay: 50,

  preview: null,
  buffer: null,

  timeout: [],
  mjRunning: [],
  oldtext: [],

  index: null,
  length: null,

  useMarkdown: true,
  useMathJax: true,
  softUpdate: true,

  Init: function () {
    this.preview = document.getElementsByClassName("markjax-preview");
    this.buffer = document.getElementsByClassName("markjax-preview-buffer");
    this.textarea = document.getElementsByClassName("markjax-input");

    this.length = this.preview.length;
    for (var i = 0; i < this.length; i++) {
      this.preview[i].setAttribute("markjax-index", i);
      this.buffer[i].setAttribute("markjax-index", i);
      this.textarea[i].setAttribute("markjax-index", i);
    }
  },

  SwapBuffers: function (index) {
    this.preview[index].innerHTML = this.buffer[index].innerHTML
  },

  Update: function () {
    if (this.timeout[this.index]) {
      clearTimeout(this.timeout[this.index]);
    }

    this.timeout[this.index] = setTimeout(MathJax.Callback(["CreatePreview", Preview, this.index]), this.delay);
  },

  UpdateAll: function () {
    for (var i = 0; i < this.length; i++) {
      this.index = i;
      this.Update();
    }
  },

  CreatePreview: function (index) {
    this.timeout[index] = null;
    if (this.mjRunning[index]) {
      return;
    }

    var text;
    if (this.textarea[index].classList.contains("markjax-editor")) {
      text = this.textarea[index].value;
    } else {
      text = this.textarea[index].innerHTML.replace(/&lt;/mg, '<').replace(/&gt;/mg, '>');
    }

    if (this.softUpdate === true && text === this.oldtext[index]) {
      return;
    }

    this.oldtext[index] = text;

    this.mjRunning[index] = true;

    if (this.useMarkdown === true) {
      this.buffer[index].innerHTML = marked(text);
      var code = $(this.buffer[index]).find("code");
      for (var i = 0; i < code.length; i++) {
        code[i].innerHTML = code[i].innerHTML.replace(/\$/mg, '\\$');
      }

      $(this.buffer[index]).find("*").addClass("mathjax");
    } else {
      this.buffer[index].innerHTML = text;
    }

    if (this.useMathJax === true) {
      MathJax.Hub.Queue(
        ["Typeset", MathJax.Hub, this.buffer[index]],
        ["PreviewDone", this, index],
        ["resetEquationNumbers", MathJax.InputJax.TeX]
      );
    } else {
      this.PreviewDone(index);
    }
  },

  PreviewDone: function (index) {
    this.mjRunning[index] = false;
    Preview.softUpdate = true;

    if (this.useMarkdown === true) {
      var code = $(this.buffer[index]).find("code");
      for (var i = 0; i < code.length; i++) {
        code[i].innerHTML = code[i].innerHTML.replace(/\\\$/mg, '$');
      }
    }

    this.SwapBuffers(index);
  },

  // The idea here is to perform fast updates. See http://stackoverflow.com/questions/11228558/let-pagedown-and-mathjax-work-together/21563171?noredirect=1#comment46869312_21563171
  // But our implementation is a bit buggy: flickering, bad rendering when someone types very fast.
  //
  // If you want to enable such buggy fast updates, you should
  // add something like  onkeypress="Preview.UpdateKeyPress(event)" to textarea's attributes.
  UpdateKeyPress: function (event) {
    if (event.keyCode < 16 || event.keyCode > 47) {
      this.preview[this.index].innerHTML = '<p>' + marked(this.textarea[this.index].value) + '</p>';
      this.buffer[this.index].innerHTML = '<p>' + marked(this.textarea[this.index].value) + '</p>';
    }
    this.Update();
  }
};

Preview.callback = MathJax.Callback(["CreatePreview", Preview]);
Preview.callback.autoReset = true;

$(document).ready(function() {
  Preview.Init();
  Preview.UpdateAll();

  autosize($("textarea.markjax-editor.markjax-input"));
  $('.modal-trigger').leanModal();

  $(".btn.modal-trigger").on("click", function() {
    $("#fullscreen-preview .modal-content").html($(".markjax-editor.markjax-preview").html());
  });

  $("#column_view").on("change", function() {
    $(".input-column").removeClass("s12 m12 l12");
    $(".preview-column").removeClass("s12 m12 l12");
    $(".input-column").addClass("s6 m6 l6");
    $(".preview-column").addClass("s6 m6 l6");
  });
  $("#stream_view").on("change", function() {
    $(".input-column").removeClass("s6 m6 l6");
    $(".preview-column").removeClass("s6 m6 l6");
    $(".input-column").addClass("s12 m12 l12");
    $(".preview-column").addClass("s12 m12 l12");
  });

  $(".markjax-editor.markjax-input").on("keyup", function(){
    Preview.index = parseInt(this.getAttribute("markjax-index"));
    Preview.Update();
  });

  $("#select-markdown").on("change", function() {
    Preview.useMarkdown = this.checked;
    Preview.softUpdate = false;
    Preview.UpdateAll();
  });
  $("#select-mathjax").on("change", function() {
    Preview.useMathJax = this.checked;
    Preview.softUpdate = false;
    Preview.UpdateAll();
  });

  $("textarea.markjax-editor.markjax-input").keydown(function(e) {
    if(e.keyCode === 9) { // tab was pressed
      // get caret position/selection
      var start = this.selectionStart;
      var end = this.selectionEnd;

      var $this = $(this);
      var value = $this.val();

      // set textarea value to: text before caret + tab + text after caret
      $this.val(value.substring(0, start) + "  " + value.substring(end));

      // put caret at right position again (add one for the tab)
      this.selectionStart = this.selectionEnd = start + 2;

      // prevent the focus lose
      e.preventDefault();
    }
  });
});
