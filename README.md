# CodeAssign Editor
Is a [SimpleMDE](https://simplemde.com/) Markdown editor powerd by [MarkJax](http://markjax.codeassign.com/) parser.

To use it you need to include both *SimpleMDE* and *MarkJax* into your page:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
<script src="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"></script>
<script type="text/javascript" src="https://codeassign.github.io/markjax/dist/markjax.min.js"></script>
```

and now when you create new `SimpleMDE` object you need to specify custom `previewRender` function which uses *MarkJax*:
```javascript
var simplemde = new SimpleMDE({                                                                                      
  previewRender: markjax
});
```
