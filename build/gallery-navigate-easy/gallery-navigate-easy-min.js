YUI.add("gallery-navigate-easy",function(b){var g=40,f=13,d=27,i=9,e=38,h=39,c="down:39+shift",a=function(j){a.superclass.constructor.apply(this,arguments);};a.NAME="Navigation";a.ATTRS={node:{setter:function(j){var k=b.one(j);if(!k){}return k;}}};b.extend(a,b.Base,{container:{containerId:null,children:[],childIndexInFocus:-1},initializer:function(j){var k=this.get("node");if(k){this.registerNavigableContainer(k);}},destructor:function(){delete this.anim;},animateScroll:function(j){this.anim=new b.Anim({node:"window",from:{scroll:[b.DOM.docScrollX(),b.DOM.docScrollY()]},to:{scroll:[b.DOM.docScrollX(),j]},duration:0.3,easing:b.Easing.easeOutStrong}).run();},scrollToCenter:function(l){var n=l.getY();var j=l.get("clientHeight");var o=j/2;var k=l.get("winHeight");if(j>k){o=0;}var m=k/2;if(n>m){if(this.anim&&this.anim.get("running")){this.anim.pause();}this.animateScroll(n-m+o);}},getNextIndex:function(l){var j=this.container,k=j.children.length;if(l!=-1){j.children[l].removeClass("highlight");}if(l===k-1){l=-1;this.wasLastChild=true;}else{this.wasLastChild=false;}l++;return l;},getPreviousIndex:function(l){var j=this.container,k=j.children.length;if(l>=0){j.children[l].removeClass("highlight");}if(l===0){l=k;}l--;if(l<0){l=0;}return l;},bringChildtoFocus:function(j){j.addClass("highlight").focus();if(this.wasLastChild){if(this.anim&&this.anim.get("running")){this.anim.pause();}j.scrollIntoView();}this.scrollToCenter(j);},onMyKeyDown:function(l){this.wasLastChild=false;l.preventDefault();var j=this.container,k=j.children.length,n=j.childIndexInFocus,m=this.getNextIndex(n);this.bringChildtoFocus(j.children[m]);j.childIndexInFocus=m;},onMyKeyUp:function(l){l.preventDefault();var j=this.container,k=j.children.length,n=j.childIndexInFocus,m=this.getPreviousIndex(n);this.bringChildtoFocus(j.children[m]);j.childIndexInFocus=m;},initiateNavigation:function(){b.one("body").on("key",function(j){console.log("Shift+RightArrow was pressed");},c);if(b.BodySubscr){this.killNavigation();}else{b.BodySubscr={};}b.BodySubscr.keydown=b.one("body").on("down",b.bind(this.onMyKeyDown,this));b.BodySubscr.keyup=b.one("body").on("up",b.bind(this.onMyKeyUp,this));},killNavigation:function(){for(var j in b.BodySubscr){b.BodySubscr.subscription.detach();delete b.BodySubscr;}},registerNavigableContainer:function(l){var k=l.all("> *");var j=[];k.each(function(o,m,n){j[m]=o;});this.container.children=j;this.container.containerId=l.generateID();return this.container;},splash:function(k){if(k){}try{}catch(j){}}});b.Nav=a;},"@VERSION@",{requires:["node","event","event-key","gallery-event-nav-keys","base","anim"],skinnable:false});