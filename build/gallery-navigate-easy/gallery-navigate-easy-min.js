YUI.add("gallery-navigate-easy",function(c){var h="down:39+shift",e="down:37+shift",b="down:68+shift",j="down:69+shift",d=true,m=false,f="transhighlight",l="containerhighlight",i=true,g=0.3,k=c.Easing.easeIn,a=function(n){a.superclass.constructor.apply(this,arguments);};a.NAME="Navigation";a.ATTRS={activeRegistryIndex:{value:null},registry:[],debug:{value:null},styleContainer:{value:false}};c.extend(a,c.Base,{container:{node:null,containerId:null,children:[],childIndexInFocus:-1,activeLink:null,isHorizontal:false,pullToTop:false},initializer:function(n){var o=this;this.reorderRegistryByRank();this.activateContainerNavigation();this.makeNextContainerNavigable();c.one("body").on("key",function(p){o.disableAllNavigation();},b);c.one("body").on("key",function(p){o.enableAllNavigation();},j);},enableAllNavigation:function(){if(this.activateContainerNavigation()){this.makeNextContainerNavigable(d);}},disableAllNavigation:function(){this.deactivateRegisteredContainer();this.deactivateContainerNavigation();},register:function(o){var q=o||{},p=q.node,n=this.get("registry");if(c.one(p)){n[n.length]=q;this.reorderRegistryByRank();}else{}},deRegister:function(p){var s=p||{},r=s.node,n=this.get("registry"),q=c.one(r),o=null;if(q){o=this.isNodeInRegistry(r);if(o!==null){n.splice(o,1);this.reorderRegistryByRank();}else{}}else{}},isNodeInRegistry:function(q){var p=0,o=this.get("registry"),n=o.length;for(p=0;p<n;p++){if(q===o[p].node){return p;}}return null;},reorderRegistryByRank:function(){var o=this.get("registry"),n=o.length,r=[],s,p,q;for(q=0;q<n;q++){r[q]=null;if(o[q].rank===undefined){o[q].rank=null;}}for(q=0;q<n;q++){s=o[q].rank;if(s&&s>0&&s<=n){if(r[s-1]!==null){o[q].rank=null;}else{r[s-1]=o[q];}}}p=0;for(q=0;q<n;q++){s=o[q].rank;if(s===null||s<=0||s>n){while(r[p]!==null){p++;}r[p]=o[q];r[p].rank=p+1;}}this.set("registry",r);},activateContainerNavigation:function(){var n=this;if(c.ContainerSubscr){return false;}else{c.ContainerSubscr={};}c.ContainerSubscr.next=c.one("body").on("key",function(o){n.makeNextContainerNavigable(d);},h);c.ContainerSubscr.prev=c.one("body").on("key",function(o){n.makeNextContainerNavigable(m);},e);return true;},deactivateContainerNavigation:function(){var o,n=c.ContainerSubscr;if(n){for(o in n){if(n.hasOwnProperty(o)){n[o].detach();}}delete c.ContainerSubscr;}this.set("activeRegistryIndex",null);},makeNextContainerNavigable:function(p){var o=this.get("registry"),q,r,s=false,n=false;if(o.length>0){q=this.getNextRegistryIndex(p);if(q!==null&&o[q]){r=c.one(o[q].node);if(r){s=o[q].isHorizontal||false;n=o[q].pullToTop||false;this.deactivateRegisteredContainer();this.registerContainer(r,(q+1),s,n);this.initiateNavigation();}else{this.deactivateRegisteredContainer();}}}},getNextRegistryIndex:function(o){var n=this.get("registry"),q,r=null,p=0;if(n&&n.length>0){for(p=0;p<n.length;p++){q=n.length;r=this.get("activeRegistryIndex");if(r===null){r=0;}else{r=o?(r+1):(r-1);if(r>=q){r=0;}if(r<0){r=q-1;}}this.set("activeRegistryIndex",r);if(c.one(n[r].node)){return r;}else{}}return r;}return null;},registerContainer:function(o,q,p,n){if(o){this.updateChildren(o,q,p,n);}},updateChildren:function(r,t,s,n){var q=r.all("> *"),p=[],o=this.container;q.each(function(w,u,v){p[u]=w;});o.isHorizontal=s||false;o.pullToTop=n||false;o.rank=t;o.node=r;o.children=p;o.containerId=r.generateID();},initiateNavigation:function(){this.activateRegisteredContainer();},deactivateRegisteredContainer:function(){this.killAllChildNavigationSubscription();if(this.get("styleContainer")){this.removeHighlightonContainer();}this.removeHighlightonCurrentChild();this.resetContainer();},removeHighlightonContainer:function(){var n=this.container;if(n&&n.node){n.node.removeClass(l);}},highlightContainer:function(){var n=this.container;if(n&&n.node){n.node.addClass(l);}},removeHighlightonCurrentChild:function(){var n=this.container,o=n.childIndexInFocus;if(o!==null&&o!==-1){n.children[o].removeClass(f);}},resetRegistryIndex:function(){this.set("activeRegistryIndex",null);},resetContainer:function(){this.container={rank:null,node:null,containerId:null,children:[],childIndexInFocus:-1,isHorizontal:false,pullToTop:false};this.wasLastChild=false;},killAllChildNavigationSubscription:function(){if(c.BodySubscr){this.detachAllChildSubscriptions();}},splash:function(s,t){var q='<h1 style="font-size:3em;color:#444;position:fixed;-webkit-transform: rotate(-10deg);" id="_splash">'+s+"</h1>",r,o,p,n=t||[0,0];r=c.one("#_splash");o=c.one("body");if(r){r.remove();}p=c.DOM.create(q);o.append(p);r=c.one("#_splash").setXY(n).addClass("cramDownOpacity");},activateRegisteredContainer:function(){var n=this.container,o;if(n&&n.node){if(this.get("styleContainer")){this.highlightContainer();}if(this.get("debug")){o=[200,200];this.splash("Rank:"+n.rank+"<br>id:"+n.node.generateID()+"<br>isHorizontal:"+n.isHorizontal,o);}}c.BodySubscr={};if(n.isHorizontal){c.BodySubscr.keyright=c.one("body").on("right",c.bind(this.onMyKeyDown,this));c.BodySubscr.keyleft=c.one("body").on("left",c.bind(this.onMyKeyUp,this));c.one("body").simulate("keydown",{keyCode:39});}else{c.BodySubscr.keydown=c.one("body").on("down",c.bind(this.onMyKeyDown,this));c.BodySubscr.keyup=c.one("body").on("up",c.bind(this.onMyKeyUp,this));c.one("body").simulate("keydown",{keyCode:40});}},detachAllChildSubscriptions:function(){var n=c.BodySubscr,o;if(n){for(o in n){if(n.hasOwnProperty(o)){n[o].detach();}}delete c.BodySubscr;}},onMyKeyDown:function(o){var n=this.container,q,p;this.wasLastChild=false;if(n){o.preventDefault();q=n.childIndexInFocus;p=this.getNextIndex(q);n.childIndexInFocus=p;this.bringChildtoFocus(n.children[p]);}},onMyKeyUp:function(o){var n=this.container,q,p;if(n){o.preventDefault();q=n.childIndexInFocus;p=this.getPreviousIndex(q);this.bringChildtoFocus(n.children[p]);n.childIndexInFocus=p;}else{}},destructor:function(){if(this.anim){delete this.anim;}},getNextIndex:function(p){var n=this.container,o=n.children.length;if(p!=-1){n.children[p].removeClass(f);}if(p===o-1){p=-1;
this.wasLastChild=true;}else{this.wasLastChild=false;}p++;return p;},getPreviousIndex:function(p){var n=this.container,o=n.children.length;if(p>=0){n.children[p].removeClass(f);}if(p===0){p=o;}p--;if(p<0){p=0;}return p;},_scroll:function(n){if(!i){window.scroll(0,n);}else{if(this.anim){delete this.anim;}this.anim=new c.Anim({node:"window",from:{scroll:[c.DOM.docScrollX(),c.DOM.docScrollY()]},to:{scroll:[c.DOM.docScrollX(),n]},duration:g,easing:k}).run();}},scrollTo:function(p){var r=p.getY(),n=p.get("clientHeight"),t=n/2,o=p.get("winHeight"),q=o/2,s=0;if(n>o){t=0;}if(r>q){if(this.anim&&this.anim.get("running")){this.anim.pause();}if(this.container&&this.container.pullToTop){s=r;}else{s=r-q+t;}}if(c.DOM.inViewportRegion(c.Node.getDOMNode(p),true,null)){return null;}else{return s;}},bringChildtoFocus:function(q){var o=q.all("a"),r=[],p,n={};q.addClass(f).focus();if(this.anim&&this.anim.get("running")){this.anim.pause();}p=this.scrollTo(q);if(p){n={childsY:q.getY(),childHeight:q.get("clientHeight"),winHeight:q.get("winHeight"),currentScrollY:c.DOM.docScrollY(),amountgoingtoScroll:p};this._scroll(p,q.getY);}if(this.activeLink){this.activeLink.blur();}o.each(function(u,s,t){r[s]=u;});if(r[0]){r[0].focus();this.activeLink=r[0];}}});c.Nav=a;},"@VERSION@",{requires:["node","event","event-key","gallery-event-nav-keys","base","anim","node-event-simulate"],skinnable:false});