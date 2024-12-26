"use strict";document.addEventListener("DOMContentLoaded",function(){{const r=document.querySelector(".email-list"),i=[].slice.call(document.querySelectorAll(".email-list-item")),o=[].slice.call(document.querySelectorAll(".email-list-item-input")),s=document.querySelector(".app-email-view-content"),c=document.querySelector(".email-filters"),n=[].slice.call(document.querySelectorAll(".email-filter-folders li")),d=document.querySelector(".email-editor"),m=document.querySelector(".app-email-sidebar"),u=document.querySelector(".app-overlay"),p=document.querySelector(".email-reply-editor"),v=[].slice.call(document.querySelectorAll(".email-list-item-bookmark")),g=document.getElementById("email-select-all"),h=document.querySelector(".email-search-input"),S=document.querySelector(".email-compose-toggle-cc"),y=document.querySelector(".email-compose-toggle-bcc"),k=document.querySelector(".app-email-compose"),f=document.querySelector(".email-list-delete"),L=document.querySelector(".email-list-read"),q=document.querySelector(".email-list-empty"),b=document.querySelector(".email-refresh"),E=document.getElementById("app-email-view"),w=[].slice.call(document.querySelectorAll(".email-filter-folders li")),C=[].slice.call(document.querySelectorAll(".email-list-item-actions li"));if(r&&new PerfectScrollbar(r,{wheelPropagation:!1,suppressScrollX:!0}),c&&new PerfectScrollbar(c,{wheelPropagation:!1,suppressScrollX:!0}),s&&new PerfectScrollbar(s,{wheelPropagation:!1,suppressScrollX:!0}),d&&new Quill(".email-editor",{modules:{toolbar:".email-editor-toolbar"},placeholder:"Message ",theme:"snow"}),p&&new Quill(".email-reply-editor",{modules:{toolbar:".email-reply-toolbar"},placeholder:"Write your message... ",theme:"snow"}),v&&v.forEach(e=>{e.addEventListener("click",e=>{var l=e.currentTarget.parentNode.parentNode,t=l.getAttribute("data-starred");e.stopPropagation(),t?l.removeAttribute("data-starred"):l.setAttribute("data-starred","true")})}),g&&g.addEventListener("click",e=>{e.currentTarget.checked?o.forEach(e=>e.checked=1):o.forEach(e=>e.checked=0)}),o&&o.forEach(e=>{e.addEventListener("click",e=>{e.stopPropagation();let l=0;o.forEach(e=>{e.checked&&l++}),l<o.length?0==l?g.indeterminate=!1:g.indeterminate=!0:l==o.length?(g.indeterminate=!1,g.checked=!0):g.indeterminate=!1})}),h&&h.addEventListener("keyup",e=>{let t=e.currentTarget.value.toLowerCase(),l={},a=document.querySelector(".email-filter-folders .active").getAttribute("data-target");(l="inbox"!=a?[].slice.call(document.querySelectorAll(".email-list-item[data-"+a+'="true"]')):[].slice.call(document.querySelectorAll(".email-list-item"))).forEach(e=>{var l=e.textContent.toLowerCase();t?-1<l.indexOf(t)?e.classList.add("d-block"):e.classList.add("d-none"):e.classList.remove("d-none")})}),n.forEach(e=>{e.addEventListener("click",e=>{let l=e.currentTarget,t=l.getAttribute("data-target");m.classList.remove("show"),u.classList.remove("show"),Helpers._removeClass("active",n),l.classList.add("active"),i.forEach(e=>{"inbox"==t||e.hasAttribute("data-"+t)?(e.classList.add("d-block"),e.classList.remove("d-none")):(e.classList.add("d-none"),e.classList.remove("d-block"))})})}),y&&y.addEventListener("click",e=>{Helpers._toggleClass(document.querySelector(".email-compose-bcc"),"d-block","d-none")}),S&&S.addEventListener("click",e=>{Helpers._toggleClass(document.querySelector(".email-compose-cc"),"d-block","d-none")}),k.addEventListener("hidden.bs.modal",e=>{document.querySelector(".email-editor .ql-editor").innerHTML="",$("#emailContacts").val(""),a()}),f&&f.addEventListener("click",e=>{o.forEach(e=>{e.checked&&e.parentNode.closest("li.email-list-item").remove()}),g.indeterminate=!1,g.checked=!1,0==document.querySelectorAll(".email-list-item").length&&q.classList.remove("d-none")}),L&&L.addEventListener("click",e=>{o.forEach(e=>{e.checked&&(e.checked=!1,e.parentNode.closest("li.email-list-item").classList.add("email-marked-read"),e=e.parentNode.closest("li.email-list-item").querySelector(".email-list-item-actions li"),Helpers._hasClass("email-read",e))&&(e.classList.remove("email-read"),e.classList.add("email-unread"),e.querySelector("i").classList.remove("ri-mail-open-line"),e.querySelector("i").classList.add("ri-mail-line"))}),g.indeterminate=!1,g.checked=!1}),b&&r){let l=$(".email-list"),t=new PerfectScrollbar(r,{wheelPropagation:!1,suppressScrollX:!0});b.addEventListener("click",e=>{l.block({message:'<div class="spinner-border text-primary" role="status"></div>',timeout:1e3,css:{backgroundColor:"transparent",border:"0"},overlayCSS:{backgroundColor:"#000",opacity:.1},onBlock:function(){t.settings.suppressScrollY=!0},onUnblock:function(){t.settings.suppressScrollY=!1}})})}var t=$(".email-earlier-msgs");t.length&&t.on("click",function(){var e=$(this);e.parents().find(".email-card-last").addClass("hide-pseudo"),e.next(".email-card-prev").slideToggle(),e.remove()});let l=$("#emailContacts");function a(){function e(e){return e.id?"<div class='d-flex flex-wrap align-items-center lh-1 me-1'><div class='avatar avatar-xs me-2 w-px-20 h-px-20'><img src='"+assetsPath+"img/avatars/"+$(e.element).data("avatar")+"' alt='avatar' class='rounded-circle' /></div>"+e.text+"</div>":e.text}l.length&&l.wrap('<div class="position-relative"></div>').select2({placeholder:"Select value",dropdownParent:l.parent(),closeOnSelect:!1,templateResult:e,templateSelection:e,escapeMarkup:function(e){return e}})}a();let e=$(".app-email-view-content");e.find(".scroll-to-reply").on("click",function(){0===e[0].scrollTop&&e.animate({scrollTop:e[0].scrollHeight},1500)}),w&&w.forEach(e=>{e.addEventListener("click",e=>{E.classList.remove("show")})}),C&&C.forEach(e=>{e.addEventListener("click",e=>{e.stopPropagation();e=e.currentTarget;Helpers._hasClass("email-delete",e)?(e.parentNode.closest("li.email-list-item").remove(),0==document.querySelectorAll(".email-list-item").length&&q.classList.remove("d-none")):Helpers._hasClass("email-read",e)?(e.parentNode.closest("li.email-list-item").classList.add("email-marked-read"),Helpers._toggleClass(e,"email-read","email-unread"),Helpers._toggleClass(e.querySelector("i"),"ri-mail-open-line","ri-mail-line")):Helpers._hasClass("email-unread",e)&&(e.parentNode.closest("li.email-list-item").classList.remove("email-marked-read"),Helpers._toggleClass(e,"email-read","email-unread"),Helpers._toggleClass(e.querySelector("i"),"ri-mail-open-line","ri-mail-line"))})})}});