!(function() {
	$('<style type="text/css">\
	.version-tip-top {border-bottom:1px solid #eee;padding:10px 10px 20px 0;}\
	.version-tip-bottom {border-top:1px solid #eee;padding:10px 10px 0 0;margin-top:10px;}\
</style>\
<div class="modal hide fade" id="too-old-version" style="_position:absolute;">\
  <div class="modal-body">\
    <p class="version-tip-top">为了获得更好的互联网使用体验，建议您使用最新的浏览器，比如：</p>\
    <div class="clearfix browser-list">\
		<a href="http://www.google.cn/intl/zh-CN/chrome/browser/"><img src="img/chrome.png"/></a>\
		<a href="http://www.mozilla.org/en-US/firefox/new/"><img src="img/firefox.png"/></a>\
		<a href="http://support.apple.com/kb/dl1531"><img src="img/safari_logo.gif"/></a>\
		<a href="http://www.opera.com/download/"><img src="img/opera.png"/></a>\
		<a href="http://windows.microsoft.com/zh-cn/internet-explorer/downloads/ie-10/worldwide-languages"><img src="img/IE10.jpg"/></a>\
    </div>\
  </div>\
  <div class="modal-footer">\
    <a href="javascript:void(0)" class="btn btn-link" data-dismiss="modal">关闭</a>\
    <a href="http://www.google.cn/intl/zh-CN/chrome/browser/" class="btn btn-primary">下载Google Chrome</a>\
  </div>\
</div>\
<script>\
	$(function() {\
		$("#too-old-version").modal("show");\
	})\
</script>').appendTo('body');
})();
