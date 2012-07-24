/**
 * Provides easy and custom navigation across various dom elements using keyboard.
 *
 * @module gallery-navigate
 */


/*CONSTANTS*/
var SHIFT_RIGHT_ARROW = 'down:39+shift',

	SHIFT_LEFT_ARROW = 'down:37+shift',

	KEY_TO_DISABLE_NAVIGATION = 'down:68+shift',

	KEY_TO_ENABLE_NAVIGATION = 'down:69+shift',

	_NEXT = true,

	_PREV = false,

	_CHILD_HIGHLIGHT_CLASS = 'transhighlight',

	_CONTAINER_HIGHLIGHT_CLASS = 'containerhighlight',

	Nav = function(config){
		Nav.superclass.constructor.apply(this, arguments);
	};

/**
* @property NAME
* @type String
* @default Navigation
*/
Nav.NAME = "Navigation";

/**
* "Associative Array", used to define the set of attributes
* added by this class. The name of the attribute is the key,
* and the object literal value acts as the configuration
* object passed to addAttrs
*/
Nav.ATTRS = {

    activeRegistryIndex:{
		value: null
    },
    
    registry: [],
 
    debug:{
		value: null
    }

};


Y.extend(Nav, Y.Base, {

    /**
    * centralized approach where this container object is the source of truth and is the only thing that is activated.
    * Container Object with:
    * - navigable container id: string
    * - children[]: Node-Array that has all the child nodes of the navigable container
    * - childIndexInFocus: Integer, that indicates the current index selected for the navigable container.
    */
    container:{
		
		node:null, /*DOM elem*/
		
		containerId:null, /*String*/
		
		children:[], /*array type*/
		
		childIndexInFocus:-1,/* if there are 10 div elements in navigable container then this variable holds the index of the one in focus*/

		activeLink : null /*holds the current link within a child of the container which is receiving focus*/
    },

    reorderRegistryByRank:function(){
		var registry = this.get('registry'),
			len = registry.length,
			newregistry = [],
			rank,j,i;

			for(i=0;i<len;i++){
				newregistry[i] = null;
				if(registry[i].rank ===undefined){
					registry[i].rank = null;
				}
			}

			for(i=0;i<len;i++){
				rank = registry[i].rank;
				if(rank && rank>0 && rank<=len){
					if(newregistry[rank-1]!==null){
						Y.log('repeated rank,making it null to resolve ambiguity'+registry[i]);
						registry[i].rank = null;
					}else{
						newregistry[rank-1] = registry[i];
					}
				}
			}

			j=0;
			for(i=0;i<len;i++){
				rank = registry[i].rank;
				if(rank===null || rank<=0 || rank>len){
					while(newregistry[j]!==null){
						j++;
					}
					newregistry[j] = registry[i];
				}
			}

			Y.log(newregistry);
			return newregistry;
    },

    /**
    * Tasks MyClass needs to perform during
    * the init() lifecycle phase
    * Function for initialization, it defaults registers the node provided in the contructor, during object creation.
    */
    initializer: function(cfg){
		var self = this;

		this.set('registry',this.reorderRegistryByRank());
		this.activateContainerNavigation();
		this.makeNextContainerNavigable();

		Y.one('body').on("key",  function(e) {
			Y.log("============================");
			Y.log('Navigation disabled');
			self.deactivateAllNavigation();
		},KEY_TO_DISABLE_NAVIGATION);

		Y.one('body').on("key",  function(e) {
			Y.log("============================");
			Y.log('Navigation enabled');
			if(self.activateContainerNavigation()){
				self.makeNextContainerNavigable(_NEXT);
			}
		},KEY_TO_ENABLE_NAVIGATION);
    },

    /**
    * Function that enables navigation on certain key-combination press
	* @method activateContainerNavigation
	* @protected
	* @param
	*
	*/
    activateContainerNavigation:function(){
		var self = this;
		if( Y.ContainerSubscr ){
			Y.log('Container navigation is already enabled');
			return false;
		}else{
			Y.ContainerSubscr = {};
		}

		Y.ContainerSubscr.next = Y.one('body').on("key",  function( e ) {
			Y.log('Shift+RightArrow was pressed');
			self.makeNextContainerNavigable(_NEXT);

		},SHIFT_RIGHT_ARROW);

		Y.ContainerSubscr.prev = Y.one('body').on("key",  function( e ) {
			Y.log('Shift+Left was pressed');
			self.makeNextContainerNavigable(_PREV);
		}, SHIFT_LEFT_ARROW);

		return true;
    },

    /**
    * Function that disables all navigation on the page using keyboard
	* @method deactivateContainerNavigation
	* @protected
	* @param
	*
	*/
    deactivateAllNavigation:function(){
		this.deactivateRegisteredContainer(); //will also disable child events
		this.deactivateContainerNavigation();
    },

    /**
    * Function that detaches all subscriptions for moving across containers
	* @method deactivateContainerNavigation
	* @protected
	* @param
	*
	*/
    deactivateContainerNavigation:function(){
		if(Y.ContainerSubscr){
			Y.log("detaching  subscriptions to navigate across container");

			for(var subscription in Y.ContainerSubscr){
				Y.log('detaching subscription:'+subscription);
				Y.ContainerSubscr[subscription].detach();
			}
			delete Y.ContainerSubscr;
		}
		this.set('activeRegistryIndex',null);
    },

    /**
    * Function that chooses the next registered container makes it navigable
	* @method makeNextContainerNavigable
	* @protected
	* @param : {boolean} shiftRight (true: get next container, false: get previous container)
	* @return {Mixed} The sanitized transition.
	* Note: this is a single function used to navigate left and right depending on the boolean @param 1
	*/
    makeNextContainerNavigable:function(shiftRight){

		var registry = this.get('registry'),
		
			index;
		
		if( registry.length > 0 ){
			index = this.getNextRegistryIndex( shiftRight );
			if( index!== null && registry[index] ){
				var node = Y.one( registry[index].node );

				if( node ){
					this.deactivateRegisteredContainer();
					this.registerContainer(node,(index+1)); //+1 , since rank starts from 1 to length of registry
					this.initiateNavigation();
				} else {
					this.deactivateRegisteredContainer();
					Y.log('Registered Container does not exist:id='+registry[index].node);
				}
			}
		} else {
			Y.log('nothing was registered for navigation');
		}
    },

    /**
    * Function that chooses the next or previous registered container index to be made navigable from registry
	* @method getNextRegistryIndex
	* @protected
	* @param : {boolean} isRightKeyPressed (true: get next container index, false: get previous container index)
	* @return {integer} valid registered container index
	*/
    getNextRegistryIndex:function(isRightKeyPressed) {
		
		var registry = this.get('registry'),
		
			regLen,
		
			regIndex=null,

			i=0;

		if(registry && registry.length>0) { //if no registry exists then nothing was registered
			for( i=0; i<registry.length; i++ ){
				regLen = registry.length;
				regIndex = this.get('activeRegistryIndex');

				if( regIndex===null ){ //case when we start first time
					regIndex = 0;
				}else{
					regIndex = isRightKeyPressed ? (regIndex+1) : (regIndex-1);
					if( regIndex>=regLen ){
						regIndex = 0;
					}
					if( regIndex<0 ){
						regIndex = regLen-1;
					}
				}

				this.set('activeRegistryIndex',regIndex);
				Y.log('NextRegistryIndex:'+this.get('activeRegistryIndex'));

				if( Y.one( registry[regIndex].node ) ){//node is fine
					return regIndex;
				}else{
					Y.log('Registry contains a node which couldnt be found on page. Node:'+registry[regIndex].node,"warn");
					Y.log('registry object format: {node:"#ad",rank:2}, erroneous object looks like below:',"warn");
					Y.log(registry[regIndex],"warn");
				}
			}
			return regIndex;
		}
		return null;
	},

    /**
    * Function to update the Class's container object with the children of current container/node being registered.
	* @method registerContainer
	* @protected
	* @param : {Node} node (Container to be scanned for its children )
	*/
    registerContainer: function(node,rank){

		if(node){
			Y.log('activating container for navigation. Node:#'+node.generateID(),"info");
			Y.log(node, "info");
			this.updateChildren(node,rank); //will update node-container.children as array
			Y.log('Navigable Container Object:', "info");
			Y.log(this.container, "info");
			Y.log('container is ready for navigation', "info");
		}else{
			Y.log('Node is invalid',"error");
		}
    },

    /**
    * @method updateChildren
	* @protected
    * @param {Node} node  String representing the navigable containers id.
    * register the container that needs navigation
    * updates the container-object:
    *	- gets all the children of the @param node, and puts them in an array.
    *	- updates the container id if it has one else generates a dummy one.
    */
    updateChildren: function(node,rank){
		var childrenObj = node.all('> *'),

			children = [],

			container = this.container;

		childrenObj.each(function(child,i,parent){
			children[i] = child;
		});

		container.rank = rank;
		container.node = node;
		container.children = children;
		container.containerId = node.generateID();//generateID() returns existing node id or creates one if it doesnt exist

		Y.log('total num of children:'+children.length, "info");
		Y.log('children:['+children+']', "info");
    },

	/**
    * @method initiateNavigation
	* @protected
	* make the children of the navigable container 'navigable'
	* @param
	*
	*/
    initiateNavigation: function(){

		this.activateRegisteredContainer();
    },

	/**
    * @method deactivateRegisteredContainer
	* @protected
	* remove all subscriptions,css on the current navigable container and its children, reset Container object
	* @param
	*
	*/
    deactivateRegisteredContainer: function(){

		this.killAllChildNavigationSubscription();
		this.removeHighlightonContainer();
		this.removeHighlightonCurrentChild();
		this.resetContainer();
    },










	/**
    * @method removeHighlightonContainer
	* @protected
	* remove any CSS highlight on the current navigable container
	* @param
	*
	*/
    removeHighlightonContainer: function(){
		var container = this.container;
		if(container && container.node){
			container.node.removeClass(_CONTAINER_HIGHLIGHT_CLASS);
		}
    },

	/**
    * @method removeHighlightonCurrentChild
	* @protected
	* remove any CSS highlight on the current container's children
	* @param
	*
	*/
    removeHighlightonCurrentChild: function(){
		var container = this.container,
			index = container.childIndexInFocus;

		if( index!==null && index!==-1 ){
			container.children[index].removeClass(_CHILD_HIGHLIGHT_CLASS);
		}
    },

	/**
    * @method resetRegistryIndex
	* @protected
	* set the Attr:activeRegistryIndex to null
	* @param
	*
	*/
    resetRegistryIndex: function(){

		this.set('activeRegistryIndex',null);
    },

	/**
    * @method resetContainer
	* @protected
	* Reset the contents of the container object
	* @param
	*
	*/
    resetContainer: function(){

		this.container = {
			rank:null, /*Integer:[1,lenofregistry]*/
			node:null, /*DOM elem*/
			containerId:null, /*String*/
			children:[], /*array type*/
			childIndexInFocus:-1/* if there are 10 div elements in navigable container then this variable holds the index of the one in focus*/
		};
		this.wasLastChild = false;
    },

	/**
    * @method killAllChildNavigationSubscription
	* @protected
	* Detach all the subscriptions to the body
	* @param
	*
	*/
    killAllChildNavigationSubscription:function() {
		if(Y.BodySubscr){
			this.detachAllChildSubscriptions();
		}
    },

	/**
    * @method splash
	* @protected
	* Splash a message onto the container: specifically its rank
	*
	*/
	splash:function(msg,position){
		
		var ele = '<h1 style="font-size:3em;color:#444;position:absolute;-webkit-transform: rotate(-30deg);" id="_splash">'+msg+'</h1>',

			splashnode,

			body,

			splash;

		Y.log('splash:'+msg, "info");
		Y.log('splash coordinates:'+position, "info");
		position[0] = position[0]-50;
		position[1] = position[1]-50;
		splashnode = Y.one('#_splash'),
		body = Y.one('body');
		if(splashnode){
			splashnode.remove();
		}

		splash = Y.DOM.create(ele);//.getDOMNode;
		body.append(splash);
		splashnode = Y.one('#_splash').setXY(position).addClass('cramDownOpacity');
	},

	/**
    * @method activateRegisteredContainer
	* @protected
	* Add CSS highlight to new container, attach key event subscriptions for the container and simulate arrow-key-down
	* @param
	*
	*/
    activateRegisteredContainer:function(){
		var container = this.container,xy;
		if(container && container.node){
			container.node.addClass(_CONTAINER_HIGHLIGHT_CLASS);
			Y.log('rank of the container:'+container.rank);
			
			/*splash coordinates*/
			if(this.get('debug')){
				xy = container.node.getXY();
				this.splash('Rank:'+container.rank+'<br>id:'+container.node.generateID(),xy);
				//////////////////////
			}
		}
		
		/** on KeyDown **/
		Y.BodySubscr = {};
		Y.log('attaching new subscription for child navigation',"info");
		Y.BodySubscr.keydown = Y.one('body').on('down',Y.bind(this.onMyKeyDown,this));
		/** ON KeyUp **/
		Y.BodySubscr.keyup = Y.one('body').on('up',Y.bind(this.onMyKeyUp,this));
		Y.one('body').simulate("keydown", { keyCode: 40 });
    },

	/**
    * @method detachAllChildSubscriptions
	* @protected
	* Function to detach navigation and all events needed to navigate within a container through the children
	*
	* @param none
	*
	*/
    detachAllChildSubscriptions: function() {
		
		var BodySubscr = Y.BodySubscr;

		if(BodySubscr){
			Y.log("detaching existing subscriptions");
			for(var subscription in BodySubscr){
				Y.log('detaching subscription:'+subscription, "info");
				BodySubscr[subscription].detach();
			}
			delete Y.BodySubscr;
		}
    },

	/**
    * @method onMyKeyDown
	* @protected
    * on keyboard down key press, will focus/navigate to next child of the container registered
    */
    onMyKeyDown: function( e ){

		var container = this.container,
			childIndexInFocus,
			newindex;

		this.wasLastChild = false; //for handling some edge case where on down key we navigate back to 1st child.
		if( container ){
			e.preventDefault();
			childIndexInFocus = container.childIndexInFocus,
			newindex = this.getNextIndex(childIndexInFocus);
			Y.log('on down-arrow-Key press:child index infocus:'+newindex, "info");
			container.childIndexInFocus=newindex;
			this.bringChildtoFocus(container.children[newindex]);
		}else{
			Y.log('no container is active on arrow key down',"warn");
		}
	},

	/**
    * @method onMyKeyUp
	* @protected
    * on keyboard up key press, will focus/navigate to next child of the container registered
    */
	onMyKeyUp: function(e){
		var container = this.container,
			childIndexInFocus,
			newindex;

		if( container ){
			e.preventDefault();
			childIndexInFocus = container.childIndexInFocus,
			newindex = this.getPreviousIndex(childIndexInFocus);
			Y.log('onkeyup:Infocus:'+newindex);
			this.bringChildtoFocus(container.children[newindex]);
			container.childIndexInFocus=newindex;
		}else{
			Y.log('no container is active on arrow key up',"warn");
		}
	},

    /**
    * Tasks MyClass needs to perform during
    *
    * the destroy() lifecycle phase
    */
    destructor : function() {
		/* Use purge ( recurse  type ) chainable
		Provided by the node-base module.
		Defined in node/js/node-event.js:69
		Removes event listeners from the node and (optionally) its subtree
		*/
		delete this.anim;
    },

	/**
	* Function to enable smooth scrolling
	* @param: y - integer, that represents the calculated height by which scroll should happen on Y axis on window object
	*
	*/
    animateScroll: function(y){
		this.anim = new Y.Anim({
          node: 'window',
          from: {
			scroll: [Y.DOM.docScrollX(),Y.DOM.docScrollY()]
          },
          to: {
            scroll : [Y.DOM.docScrollX(),y]
          },
          duration: 0.2,
          easing:  Y.Easing.easeNone
        }).run();
		/**  //http://yuilibrary.com/yui/docs/api/classes/Easing.html
		* backBoth backIn backOut bounceBoth bounceIn bounceOut easeBoth easeBothStrong easeIn easeInStrong easeNone easeOut easeOutStrong elasticBoth elasticIn elasticOut
		*/
       
    },

	/**
	* Function to get the next child index on key down event.
	* @param :integer, previous child index (for eg: 0 means 1st child)
	* @return: integer, the new child index to be navigated to or focused to.
	*/
	getNextIndex: function(childIndexInFocus){
		var container = this.container,
			numofChildren = container.children.length;
		if(childIndexInFocus!=-1){
			container.children[childIndexInFocus].removeClass(_CHILD_HIGHLIGHT_CLASS);
		}
		if(childIndexInFocus===numofChildren-1) {
			childIndexInFocus=-1;
			this.wasLastChild= true;
		} else {
			this.wasLastChild = false;
		}
		childIndexInFocus++;

		return childIndexInFocus;
	},

	/**
	* Function to retrieve the child-index previous to the @param1  on key up event.
	* @param :integer, current child index in focus (for eg: 0 means 1st child)
	* @return: integer, the new child index to be navigated to or focused to.
	*/
	getPreviousIndex: function(childIndexInFocus) {
		var container = this.container,
			numofChildren = container.children.length;
		if(childIndexInFocus>=0){
			container.children[childIndexInFocus].removeClass(_CHILD_HIGHLIGHT_CLASS);
		}
		if(childIndexInFocus===0) {
			childIndexInFocus=numofChildren;
		}
		childIndexInFocus--;
		if(childIndexInFocus<0) {
			childIndexInFocus=0;
		}
		return childIndexInFocus;
	},

    /**
    * Function to adjust scrolling and centering the child element which is in focus
    * @param Node: DOM element(child node in focus of the navigable container)
    * @return : Integer:amount to scroll to get the elem under focus to the center
    */
	scrollToCenter: function(Node){
		var childsY = Node.getY(),
			childHeight = Node.get('clientHeight'),
			adjustScroll = childHeight/2,
			winHeight = Node.get('winHeight'),
			halfwinheight = winHeight/2;

		if(childHeight>winHeight){
			adjustScroll = 0;  //this is to make sure that if the child is taller than the screen then just position it								// position its top at the center of the screen.
		}
		if(childsY>halfwinheight){
			if(this.anim && this.anim.get('running')){
				this.anim.pause();
			}
			return childsY-halfwinheight+adjustScroll;
		}else{
			Y.log('Elements Y coordinate is less than half the window height',"info");
		}
		return 0;
	},

	/**
	* Function to get the new child into focus and right scroll
	* @param: Node, representing the child that should gain focus.
	*
	*/
	bringChildtoFocus:function(childInFocus){
		/**related to getting the first link on reaching a child node**/
		var link = childInFocus.all('a'),
			linkArr = [],
			amounttoScroll;

		childInFocus.addClass(_CHILD_HIGHLIGHT_CLASS).focus();
		if( this.activeLink ){
			this.activeLink.blur();
		}

		link.each(function(child,i,parent){
			linkArr[i] = child;
		});

		if( linkArr[0] ){
			linkArr[0].focus();
			this.activeLink = linkArr[0];
		}

		if( this.anim && this.anim.get('running') ){
			this.anim.pause();
		}
		
		if( this.wasLastChild ){
			Y.log('last child', "info");   //this needs to be outside since both up and down needs this
			childInFocus.scrollIntoView(); //this is a temp fix try to remove this and fix navigation later
		}

		if( this.container.childIndexInFocus===0 ){
			childInFocus.scrollIntoView();
		}
		amounttoScroll = this.scrollToCenter(childInFocus);
		//window.scroll(0,amounttoScroll);
		this.animateScroll(amounttoScroll);
	}

});






Y.Nav = Nav;