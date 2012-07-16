YUI.add('gallery-navigate-easy', function(Y) {

/**
 * Provides easy and custom navigation across various dom elements using keyboard.
 *
 * @module gallery-navigate
 */



/*CONSTANTS*/
var KEY_DOWN  = 40,
	KEY_ENTER = 13,
	KEY_ESC   = 27,
	KEY_TAB   = 9,
	KEY_UP    = 38,
	KEY_RIGHT = 39;





var Nav = function(config){
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

    node: {
        setter: function(node) {
            var n = Y.one(node);
            if (!n) {
                Y.log('Invalid Node Given in initialization ' + node);
            }
            return n;
        }
    }
};

Y.extend(Nav, Y.Base, {
    /**
    * Id of the Node
    */
    container:{
		containerId:null, /*String*/
		children:[], /*array type*/
		childIndexInFocus:-1
    },



    /**
    * Tasks MyClass needs to perform during
    * the init() lifecycle phase
    */
    initializer: function(cfg){
		var node = this.get('node');
		Y.log(node);
		if(node){
			this.registerNavigableContainer(node);
			Y.log(this.container,'debug');
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
    },


    /**
    * Function to adjust scrolling and centering the child element which is in focus
    * @param Node: DOM element(child node in focus of the navigable container)
    */
	scrollToCenter: function(Node){
		var childsY = Node.getY();
		var childHeight = Node.get('clientHeight');
		var adjustScroll = childHeight/2;
		var winHeight = Node.get('winHeight');
		if(childHeight>winHeight){
			adjustScroll = 0;  //this is to make sure that if the child is taller than the screen then just position it
								// position its top at the center of the screen.
		}
		var halfwinheight = winHeight/2;
		if(childsY>halfwinheight){
			window.scroll(0,childsY-halfwinheight+adjustScroll);
		}
	},
    /**
    * Function
    * on keyboard down key press, will focus/navigate to next child of the container registered
    */
    onMyKeyDown: function(e){
			e.preventDefault();
			var container = this.container,
				numofChildren = container.children.length,
				childIndexInFocus = container.childIndexInFocus;
			
			if(childIndexInFocus!=-1){
				//container.children[childIndexInFocus].replaceClass('dark','bright');
				container.children[childIndexInFocus].removeClass('highlight');
			}
			if(childIndexInFocus===numofChildren-1) {
				childIndexInFocus=-1;
				
			}
			childIndexInFocus++;
			Y.log('onkeydown:infocus:'+childIndexInFocus);

			var childInFocus = container.children[childIndexInFocus];

			//childInFocus.replaceClass('bright','dark').focus().scrollIntoView();
			childInFocus.addClass('highlight').focus().scrollIntoView();
			this.scrollToCenter(childInFocus);
			container.childIndexInFocus=childIndexInFocus;
	},
    /**
    * Function
    * on keyboard up key press, will focus/navigate to next child of the container registered
    */
	onMyKeyUp: function(e){
			e.preventDefault();
			var container = this.container;
			var numofChildren = container.children.length;
			var childIndexInFocus = container.childIndexInFocus;
			if(childIndexInFocus>=0){
				//container.children[childIndexInFocus].replaceClass('dark','bright');
				container.children[childIndexInFocus].removeClass('highlight');
			}
			if(childIndexInFocus===0) {
				childIndexInFocus=numofChildren;
			}
			childIndexInFocus--;
			if(childIndexInFocus<0) {
				childIndexInFocus=0;
			}
			Y.log('onkeyup:Infocus:'+childIndexInFocus);
			var childInFocus = container.children[childIndexInFocus];
			//childInFocus.replaceClass('bright','dark').focus().scrollIntoView();
			childInFocus.addClass('highlight').focus().scrollIntoView();
			this.scrollToCenter(childInFocus);
			//container.children[childIndexInFocus].scrollIntoView();
			container.childIndexInFocus=childIndexInFocus;
	},

    initiateNavigation:function(){
		Y.on('keypress', Y.bind(function (e) {
			if (e.keyCode === 39) {
				e.halt();
				alert('right key pressed');
			}
		}));
		/** on KeyDown **/
		Y.one('body').on('down',Y.bind(this.onMyKeyDown,this));
		/** ON KeyUp **/
		Y.one('body').on('up',Y.bind(this.onMyKeyUp,this));
    },

    registerNavigableContainer: function(node){
		var childrenObj = node.all('> *');
		var children = [];
		childrenObj.each(function(child,i,parent){
			children[i] = child;
		});
		this.container.children = children;
		this.container.containerId = node.generateID();//generateID() returns existing node id or creates one if it doesnt exist
		return this.container;
    },
	/**
	* @param NodeId
	*/
    register: function(NodeId) {
		//register the container that needs navigation
    },



	/**
	* @param NodeId
	*/
    attachNavigation: function(Nodeid){

    },




	/** test function which outputs a message to console.
	* @param msg(String)
	*/
    splash : function(msg){
		if(msg){
			Y.log(msg);
		}
		try{
			Y.log(this.get('node').addClass('dark'));
		} catch(err){
			Y.log(err);
		}
	}


});




Y.Nav = Nav;


}, '@VERSION@' ,{requires:['node', 'event', 'event-key', 'gallery-event-nav-keys', 'base', 'node-event-simulate'], skinnable:false});
