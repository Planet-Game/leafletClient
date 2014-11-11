/*
 * leaflet client animator
 * Owner: Wook Shim (wshim@sk.com)
 * License: SK planet wholly owned
 */

(function( $, window, document, undefined ) {

	var hasTouch = 'ontouchstart' in window,
		start = hasTouch ? "touchstart" : "mousedown",
		move = hasTouch ? "touchmove" : "mousemove",
		end = hasTouch ? "touchcancel touchend" : "mouseup";

	var leaf = { //storage for global vars

		animating: false,

		enableAnim: false,

		hashed: false,

		hashId: "leaflet",

		iOS: false,

		scrollThreshold: 0.1,

		swipeThreshold: 0.1
	};

	var main = {

		expanded: false,

		flipping: false,

		scrollTop: 0,

		transDuration: 700,

		scrollDuration: 200,

		flipInterval: null
	};

	var sub = {

		scrolling: false,

		sliding: false,

		transitioning: false,

		itemIndex: 0,

		itemTx: 0,

		itemWidth: 330,

		bodyWidth: 330,

		minScroll: 10,

		minSliding: 10,

		transTimer: null,

		transDuration: 350
	};

	var touch = {

		pos: null,

		sx: 0,

		sy: 0,

		mx: 0,

		my: 0,

		ox: 0,

		oy: 0,

		tx: 0,

		ty: 0,

		vx: 0,

		moves: [],

		scrolls: []
	};

	var flip = {

		playStatus: "idle",

		currentFrame: 0,

		frameLength: 25,

		totalDuration: 700,

		frameDuration: 700 / 25,

		interval: null,

		playQueue: null,
	};

	//dom elements
	var $document = $( document ),
		$this,
		$scroll,
		$leaf,
		$leafHeader,
		$leafFooter,
		$items,
		$itemHeader,
		$itemBody,
		$itemBodyList,
		$itemBodyListitem,
		$itemFooter,
		$flipArea,
		$selectedPagination,
		$selectedThumbnail,
		$selectedItem,
		$selectedBody,
		$selectedList,
		$selectedListitem,
		$selectedListitems,
		$selectedItemFooter,
		$selectedItemsPrev,
		$selectedItemsNext;


	$document.ready( function() {

		leaf.checkDevice();
		leaf.initVars();
		leaf.bindEvents();
		leaf.loadImages();

		if( leaf.iOS ) {
			$body.addClass( "ios" );
			bouncefix.add( "leaf" );
			$scroll = $leaf;
		} else {
			$scroll = $body;
		}

		if( leaf.enableAnim ) {
			$leaf.addClass( "enable-anim" );
			leaf.setFlipAnimation();
		} else {
			main.transDuration = 0;
			sub.transDuration = 0;
		}
	});

	leaf.checkDevice = function() { //support 3d animation for Android 4.2 and iOS 6 or above
		var ua = navigator.userAgent,
			index,
			version;

		if( ua.indexOf( "Android" ) !== -1 ) {
			index = ua.indexOf( "Android" ) + 8;
			version = ua.slice( index, index + 3 ).split( "." ); //[ "4", "3" ]

			if( version[ 0 ] >= 4 && version[ 1 ] >= 3 ) {
				leaf.enableAnim = true;
			}
		} else if( ua.indexOf( "iPhone") || ua.indexOf( "iPad" ) ) {
			index = ua.indexOf( "OS" ) + 3;
			version = ua.slice( index, index + 3 ).split( "_" ); //[ "7", "0" ]

			if( version[ 0 ] >= 6 ) {
				leaf.enableAnim = true;
				leaf.iOS = true;
			}
		}
	};

	leaf.initVars = function() {
		$body = $( "body" );
		$leaf = $( ".leaf" ).height( $( window ).height() );
		$leafHeader = $( ".leaf-header" );
		$leafFooter = $( ".leaf-footer" );
		$items = $( ".item" );
		$itemHeader = $( ".item-header" );
		$itemBody = $( ".item-body" );
		$itemBodyList = $( ".item-body-list" );
		$flipArea = $( ".flip-area" );
		$itemFooter = $( ".item-footer" );
		$itemBodyListitem = $( ".item-body-listitem" );

		sub.itemWidth = $itemBodyListitem.width();
		flip.playQueue = new AnimQueue();
	};

	leaf.bindEvents = function() {

		$( ".item>.wrap" ).on( "click", function( e ){
			e.preventDefault();

			if( !leaf.animating ) {
				leaf.animating = true;

				$this = $( this );
				$selectedItem = $this.parent( ".item" );

				if( !main.expanded ) {
					leaf.expandItem();
				} else {
					leaf.shrinkItem();
				}
			}
		});

		$( ".prev-img" ).on( "click", function( e ){
			e.preventDefault();
			e.stopPropagation();

			touch.ox = Math.min( touch.ox + sub.itemWidth, 0 );
			leaf.transLeaf();
		});

		$( ".next-img" ).on( "click", function( e ){
			e.preventDefault();
			e.stopPropagation();

			touch.ox = Math.max( touch.ox - sub.itemWidth, -sub.bodyWidth );
			leaf.transLeaf();
		});

		$( ".leaf-footer img" ).load(function() { //to hide grey area while loading flip bg image
			if( leaf.enableAnim ) {
				$itemFooter.addClass( "loaded" );
			}
		});
	};

	leaf.loadImages = function() {

		changeDataSrc( ".item-body-listitem img:first" ); //first image
		changeDataSrc( ".pagination ol img" ); //thumbnail images
		changeDataSrc( ".item-body-listitem img" ); //remaining images
		changeDataSrc( ".leaf-footer img" ); //flip bg

		function changeDataSrc( selector ) {
			var $image;

			$( selector ).each(function() {
				$image = $( this );

				if( $image.attr( "src") !== $image.attr( "data-src") ) { //prevent duplicate change
					$image.attr( "src", $image.attr( "data-src" ) );
				}
			});
		}
	};

	leaf.setFlipAnimation = function() {
		if( leaf.enableAnim ) {
			if( !leaf.iOS ) {
				main.flipInterval = setInterval( flipInterval, 100 );
			} else {
				$leaf.on( start, function() {
					touch.scrolls = [];
				});

				$leaf.on( move, function() {
					touch.scrolls.push({
						time: Date.now(),
						scroll: $scroll.scrollTop()
					});

					if( getScrollVelocity() > leaf.scrollThreshold ) {
						flip.playQueue.fill();
					}
				});
			}
		}

		function flipInterval() {
			if( touch.scrolls.length > 20 ) {
				touch.scrolls = touch.scrolls.slice( -5 );
			}

			touch.scrolls.push({
				time: Date.now(),
				scroll: $scroll.scrollTop()
			});

			if( getScrollVelocity() > leaf.scrollThreshold ) {
				flip.playQueue.fill();
			}
		}
	};

	leaf.clearFlipAnimation = function() {
		if( leaf.enableAnim ) {
			if( !leaf.iOS ) {
				touch.scrolls = [];
				clearInterval( main.flipInterval );
			} else {
				$leaf.off( start );
				$leaf.off( move );
			}
		}
	};

	leaf.expandItem = function() {
		beforeExpansion();

		if( leaf.enableAnim ) {
			$scroll.animate({
					scrollTop: leaf.scrollTop
				}, main.scrollDuration,
				onExpansion
			);
		} else {
			$scroll.scrollTop( leaf.scrollTop );
			onExpansion();
		}

		//local functions for expansion
		function beforeExpansion() {
			main.expanded = true;

			if( !leaf.iOS ) {
				leaf.scrollTop = $selectedItem.position().top;
			} else {
				leaf.scrollTop = $leaf.scrollTop() + $selectedItem.position().top;
			}

			if( !leaf.hashed ) {
				location.hash = leaf.hashId;
				leaf.hashed = true;
				// $scroll.scrollTop( leaf.scrollTop );
			}

			$leafFooter.addClass( "expand" );

			if( leaf.enableAnim ) {
				leaf.clearFlipAnimation();
			}
		}

		function onExpansion() {
			setSelected();

			$( $selectedThumbnail.get( 0 ) ).addClass( "active" );
			if ( $selectedListitems.length >= 6 ) { //highlight next arrow button
				$selectedPagination.addClass( "highlight" );
			}

			if( leaf.enableAnim ) {
				locate3d();

				$selectedItem.addClass( "selected expand" );//start expand transition

				setTimeout(function() {
					$selectedItemFooter.css({
					    "-webkit-transition": "-webkit-transform " + ( main.transDuration / 1000 ) + "s",
					   	"-webkit-transform": "translateY(99%)"
					});
				}, 10 );


			} else {
				$selectedItemFooter.css( "display", "none" );
				$selectedItem.addClass( "selected expand" );//start expand transition
			}

			setTimeout( afterExpansion, main.transDuration );


			function setSelected() {
				$selectedPagination = $this.find( ".pagination" );
				$selectedThumbnail = $selectedPagination.find( ".thumb" );
				$selectedBody = $this.find( ".item-body" );
				$selectedList = $this.find( ".item-body-list" );
				$selectedListitems = $selectedList.find( ".item-body-listitem" );
				$selectedListitem = $( $selectedListitems[ 0 ] );
				$selectedItemFooter = $this.find( ".item-footer" );
				$selectedItemsPrev = $selectedItem.prevAll( ".item" );
				$selectedItemsNext = $selectedItem.nextAll( ".item" );
			}

			function locate3d() {
				$selectedItemsNext.each(function() {
					var $item = $( this );

					if( !leaf.iOS) {
						$item.data( "ty", $item.position().top );
					} else {
						$item.data( "ty", leaf.scrollTop + $item.position().top );
					}

					$item.css({
						"-webkit-transform": "translateY(" + $item.data( "ty" ) + "px)"
					});
				});

				$selectedItemsNext.addClass( "prepare3d" ).each(function() {
					var $item = $( this );

					$item.css({
						"-webkit-transition": "-webkit-transform 1s",
						"-webkit-transform": "translateY(" + ( $item.data( "ty" ) + 1.4 * $item.height() ) + "px)"
					});
				});
			}
		}

		function afterExpansion() {
			$body.addClass( "expanded" ); //prepare body for expand transition(overflow-y:hidden)
			sub.bodyWidth = ( $selectedListitems.length - 1 ) * sub.itemWidth;

			if( leaf.enableAnim ) {
				sub.itemTx = 0;

				$selectedListitems.addClass( "display" ).each( function() {
					$( this ).data( "tx", sub.itemTx );
					$( this ).css( "-webkit-transform",  "translate3d( " + sub.itemTx + "px, 0, 0 )" );
					sub.itemTx += sub.itemWidth;
				});

				$selectedItemsPrev.css( "opacity", "0" );
				$selectedItemsNext.css( "opacity", "0" );
			} else {
				$selectedItemsPrev.css( "visibility", "hidden" ); //To be fixed
				$selectedItemsNext.css( "display", "none" );
			}

			leaf.checkCompleted();
			leaf.animating = false;
		}
	};

	leaf.shrinkItem = function() {
		beforeShrink();

		setTimeout( afterShrink, main.transDuration * 1.3 );

		//local functions
		function beforeShrink() {
			touch.ox = 0; //reset list-item position
			sub.itemIndex = 0;

			$body.removeClass( "expanded" );
			//shrink transition(reverse of expand)
			if( leaf.enableAnim ) {
				unlocate3d();

				$selectedList.css( "-webkit-transform", "" );
				$selectedListitems.css( "-webkit-transform", "" );
				$selectedItemFooter.css({
					"-webkit-transform": "translateY(50%)"
				});
				$selectedListitems.removeClass( "display" ); //hide list-item

				$selectedItemsPrev.css( "opacity", "" );
				$selectedItemsNext.css( "opacity", "" );
			} else {
				$selectedItemFooter.css( "display", "block" );
				$selectedListitems.css( "display", "" );

				$selectedItemsPrev.css( "visibility", "visible" );
				$selectedItemsNext.css( "display", "block" );
			}

			$selectedPagination.removeClass( "shift" ); //reset pagination
			$selectedThumbnail.removeClass( "active" );
			$selectedItem.removeClass( "selected" );

			$scroll.scrollTop( leaf.scrollTop ); //recover scrollTop changed by empty hash
			$leafFooter.removeClass( "expand" );

			function unlocate3d() {

				$selectedItemsNext.each(function() {
					$( this ).css({
						"-webkit-transform": "translateY(" + $( this ).data( "ty" ) + "px)"
					});
				});
			}
		}

		function afterShrink() {
			if( leaf.enableAnim ) {
				$items.removeClass( "prepare3d" ).css({
					"-webkit-transition": "",
					"-webkit-transform": ""
				});

				$selectedItemFooter.css({
				    "-webkit-transition": "",
				    "-webkit-transform": ""
				});

				leaf.setFlipAnimation();
			}

			$selectedItem.removeClass( "expand" );
			$items.not( ".selected" ).css( "display", "block" );

			resetSelected();

			main.expanded = false;
			leaf.animating = false;

			$selectedItem.addClass( "visited" );

			function resetSelected() {
				$selectedPagination = null;
				$selectedThumbnail = null;
				$selectedBody = null;
				$selectedList = null;
				$selectedListitems = null;
				$selectedListitem = null;
				$selectedItemFooter = null;
				$selectedItemsPrev = null;
				$selectedItemsNext = null;
			}
		}
	};

	$( window ).on( "hashchange", function() {

		if( !leaf.animating && main.expanded ) { //hashchange by back button
			leaf.hashed = false;
			leaf.shrinkItem();
		}
	});

	$document.on( start, function( e ) {

		if( !leaf.animating ) {
			touch.pos = hasTouch? e.originalEvent.touches[ 0 ] : e;
			touch.sx = touch.pos.clientX;
			touch.sy = touch.pos.clientY;
			touch.moves = [];

			if ( leaf.enableAnim && !main.expanded ) {
				leaf.clearFlipAnimation();
				leaf.setFlipAnimation();
			}
		}
	});

	$document.on( move, function( e ) {

		if( !leaf.animating && !sub.transitioning ) {
			touch.pos = hasTouch? e.originalEvent.changedTouches[ 0 ] : e;
			touch.mx = touch.pos.clientX;
			touch.my = touch.pos.clientY;

			touch.moves.push({
				time: Date.now(), //need to check compability
				x: touch.mx,
				y: touch.my
			});
		}

		if( main.expanded && touch.mx ) {
			e.preventDefault(); //to prevent scrolling on various android

			if( !sub.transitioning && $( e.target ).parents( ".item-body" ).length !== 0 ) { //subpage swipe & scroll

				if( sub.sliding === false ) {
					if( sub.scrolling ) {
						subScroll();
					} else {
						if( Math.abs( touch.sy - touch.my ) > sub.minScroll ) { //enable vertical scroll
							sub.scrolling = true;
						} else if( Math.abs( touch.mx - touch.sx ) > sub.minSliding ) {
							sub.sliding = touch.mx;
						}
					}
				} else {
					touch.tx = Math.max( -sub.bodyWidth, Math.min( touch.ox + touch.mx - sub.sliding, 0 ) );

					if( leaf.enableAnim ) {
						$selectedList.css( "-webkit-transform", "translate3d( " + touch.tx + "px, 0, 0 )" );
					}
				}
			}
		}

		function subScroll() {
			var maxY = 0,
				minY = $selectedBody.innerHeight() - $selectedListitem.innerHeight();

			touch.ty = Math.max( minY, Math.min( 0, touch.oy + touch.my - touch.sy ) );
			if( leaf.enableAnim ) {
				$selectedListitem.css( "-webkit-transform", "translate3d( " + $selectedListitem.data( "tx" ) + "px, " + touch.ty + "px, 0 )" );
			} else {
				$selectedListitem.css( "-webkit-transform", "translateY( " + touch.ty + "px )" );
			}
		}
	});

	$document.on( end, function( e ) {

		if( main.expanded && $( e.target ).parents( ".item-body-list" ).length === 0 ) {
			// e.preventDefault();
			return;
		}

		if( main.expanded && $( e.target ).parents( ".selected" ) !== 0 ) {
			// e.preventDefault();

			if( sub.scrolling ) {
				touch.oy = touch.ty;
			}

			if( !sub.scrolling && touch.moves.length !== 0 ) {

				touch.vx = getHorizontalVelocity();

				if( touch.vx > leaf.swipeThreshold ) { //swipe left by velocity
					touch.ox = Math.max( touch.ox - sub.itemWidth, -sub.bodyWidth );
				}
				else if( touch.vx < -leaf.swipeThreshold ) { //swipe right by velocity
					touch.ox = Math.min( touch.ox + sub.itemWidth, 0 );
				} else { //swipe by horizontal diff
					touch.ox = -Math.round( -touch.tx / sub.itemWidth ) * sub.itemWidth;
				}

				leaf.transLeaf();
			}

			sub.sliding = false;
			sub.scrolling = false;
		}
	});


	leaf.transLeaf = function( dir ) {

		if( touch.ox !== touch.tx ) {

			touch.tx = touch.ox;
			sub.itemIndex = -touch.ox / sub.itemWidth;
			$selectedListitem = $( $selectedListitems[ sub.itemIndex ] );

			if( leaf.enableAnim ) {
				clearTimeout( sub.transTimer );

				sub.transitioning = true;
				$selectedList.css( "-webkit-transition", "-webkit-transform " + sub.transDuration / 1000 + "s" );

				sub.transTimer = setTimeout( function() {
					sub.transitioning = false;
					$selectedList.css( "-webkit-transition", "" );
				}, sub.transDuration );

				$selectedList.css({
					"-webkit-transform": "translate3d(" + touch.ox + "px, 0, 0 )"
				});
			} else {
				$selectedListitems.css( "display", "none" );
				$selectedListitem.css( "display", "block" );
			}

			checkActivated();
			checkShifted();
			leaf.checkCompleted();
		}

		function checkActivated() {
			$selectedThumbnail.removeClass( "active" );
			$( $selectedThumbnail.get( sub.itemIndex ) ).addClass( "active" );
		}

		function checkShifted() {
			if( sub.itemIndex === 5 && !$selectedPagination.hasClass( "shift" ) ) {
				$selectedPagination.addClass( "shift" );
			} else if( sub.itemIndex === 4 && $selectedPagination.hasClass( "shift" ) ) {
				$selectedPagination.removeClass( "shift" );
			}
		}
	};

	leaf.checkCompleted = function() {
		if( sub.itemIndex === $selectedListitems.length - 1 ) {
			$document.trigger( "viewComplete" );
		}
	};

	function getScrollVelocity() {
			var arr = touch.scrolls;

			if( touch.scrolls.length > 1 ) { //not enough scrolls
				arr = touch.scrolls.slice( -2 );

				return ( arr[ 1 ].scroll - arr[ 0 ].scroll ) / ( arr[ 0 ].time - arr[ 1 ].time );
			}
			return 0;
	}

	function getHorizontalVelocity() {
		var arr;

		if( touch.moves.length > 1 ) { //not enough moves
			arr = touch.moves.slice( -2 );

			return ( arr[ 1 ].x - arr[ 0 ].x ) / ( arr[ 0 ].time - arr[ 1 ].time );
		}
		return 0;
	}

	// function getVerticalVelocity( moves ) {
	// 	var m;

	// 	if( moves.length > 1 ) { //not enough moves
	// 		m = moves.slice( -2 );

	// 		return ( m[ 1 ].y - m[ 0 ].y ) / ( m[ 0 ].time - m[ 1 ].time );
	// 	}
	// 	return 0;
	// }

	//For animation control
	function AnimQueue() {
		this.elems = [];
		this.status = "idle";
		this.timer = null;
	}

	AnimQueue.prototype = {

		enqueue: function( elem ) {
			this.elems.push( elem );
		},

		dequeue: function() {
			if( this.elems.length !== 0 ) {
				return this.elems.shift();
			}
		},

		size: function() {
			return this.elems.length;
		},

		fill: function() {
			if( flip.playStatus === "idle" ) {
				this.enqueue( new Player( "forward", flip.frameDuration, flip.totalDuration / 2, 0, 12, "up" ) );
				this.enqueue( new Player( "forward", flip.frameDuration, flip.totalDuration / 2, 12, 24, "down" ) );
				this.dequeue().play();
			} else if( flip.playStatus === "down" && $scroll.scrollTop() > 0 ) {
				this.empty();
				this.enqueue( new Player( "backward", flip.frameDuration / 4, ( flip.currentFrame - 13 ) * flip.frameDuration / 4, flip.currentFrame - 1, 13, "reverse" ) );
				this.enqueue( new Player( "none", flip.frameDuration, 200, 12, 12, "hold" ) );
				this.enqueue( new Player( "forward", flip.frameDuration, flip.totalDuration / 2, 13, 24, "down" ) );
			}
		},

		empty: function() {
			clearInterval( flip.interval );
			flip.playQueue.elems = [];
		},

		next: function() {
			if( flip.playQueue.size() !== 0 ) {
				flip.playQueue.dequeue().play();
			} else {
				flip.playStatus = "idle";
				$items.removeClass( "flipping" );
			}
		}
	};

	function Player( direction, interval, duration, from, to, status ) {
		this.direction = direction;
		this.interval = interval;
		this.duration = duration;
		this.from = from;
		this.to = to;
		this.status = status;
	}

	Player.prototype = {

		setFrame: function( index ) {
			$flipArea.css( "background-position", "0% " + 100 * index / ( flip.frameLength - 1 ) + "%" );
		},

		play: function() {
			var player = this;

			flip.currentFrame = player.from;
			player.setFrame( flip.currentFrame );
			flip.playStatus = player.status;

			if( player.direction !== "none" ) {
				flip.interval = setInterval(function() {
					$items.addClass( "flipping" );

					if( flip.currentFrame !== player.to ) {
						if( player.direction === "forward" ) {
							flip.currentFrame = ( flip.currentFrame + 1 ) % 25;
						} else if( player.direction === "backward" ) {
							flip.currentFrame = ( flip.currentFrame - 1 ) % 25;
						}
						player.setFrame( flip.currentFrame );
					}
				}, player.interval );
			}

			setTimeout(function() {
				clearInterval( flip.interval );
				flip.playQueue.next();
			}, this.duration );
		},

		stop: function( delay, callback ) {
			setTimeout(function() {
				clearInterval( flip.interval );
				if( callback ) {
					callback();
				}
			}, delay );
		},

		forward: function( duration ) {
			flip.interval = setInterval(function() {
				flip.currentFrame = ( flip.currentFrame + 1 ) % 25;
				this.setFrame( flip.currentFrame );
			}, flip.frameDuration );

			this.stop( duration || ( frameLength - flip.currentFrame - 1 ) * flip.frameDuration );
		},

		backward: function( toFrame, callback ) {
			if( flip.currentFrame > 12 ) { //no need to play backward
				toFrame = toFrame || 12;

				flip.interval = setInterval(function() {
					if( flip.currentFrame !== toFrame ) {
						flip.currentFrame = ( flip.currentFrame - 1 ) % 25;
						this.setFrame( flip.currentFrame );
					}
				}, flip.frameDuration * 0.3 );

				stop( ( flip.currentFrame - toFrame ) * flip.frameDuration * 0.3 + 200, forward );
			}
		}
	};

})( jQuery, window, document );

/*!
 * v0.3.0
 * Copyright (c) 2014 Jarid Margolin
 * bouncefix.js is open sourced under the MIT license.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['bouncefix'] = factory();
  }
}(this, function () {


/*
 * dom-event.js
 *
 * (C) 2014 Jarid Margolin
 * MIT LICENCE
 *
 */
var domEvent;
domEvent = function () {
  // ----------------------------------------------------------------------------
  // DOMEvent
  //
  // Convenient class used to work with addEventListener.
  // ----------------------------------------------------------------------------
  function DOMEvent(el, eventName, handler, context) {
    // Make args available to instance
    this.el = el;
    this.eventName = eventName;
    this.handler = handler;
    this.context = context;
    // Attach
    this.add();
  }
  //
  // Handler that manages context, and normalizes both
  // preventDefault and stopPropagation.
  //
  DOMEvent.prototype._handler = function (e, context) {
    // Copy props to new evt object. This is shallow.
    // Only done so that I can modify stopPropagation
    // and preventDefault.
    var evt = {};
    for (var k in e) {
      evt[k] = e[k];
    }
    // Normalize stopPropagation
    evt.stopPropagation = function () {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
    };
    // Normalize preventDefault
    evt.preventDefault = function () {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    };
    // Call with context and modified evt.
    this.handler.call(this.context || context, evt);
  };
  //
  // Add the `EventListener`. This method is called internally in
  // the constructor. It can also be used to re-attach a listener
  // that was previously removed.
  //
  DOMEvent.prototype.add = function () {
    // Cache this
    var self = this;
    // Cache handler so it can be removed.
    self.cachedHandler = function (e) {
      self._handler.call(self, e, this);
    };
    // Modified handler
    self.el.addEventListener(self.eventName, self.cachedHandler, false);
  };
  //
  // Remove the `EventListener`
  //
  DOMEvent.prototype.remove = function () {
    this.el.removeEventListener(this.eventName, this.cachedHandler);
  };
  // ----------------------------------------------------------------------------
  // Expose
  // ----------------------------------------------------------------------------
  return DOMEvent;
}();
/*
 * utils.js
 *
 * (C) 2014 Jarid Margolin
 * MIT LICENCE
 *
 */
var utils;
utils = function () {
  // ----------------------------------------------------------------------------
  // Utils
  // ----------------------------------------------------------------------------
  var utils = {};
  //
  // Search nodes to find target el. Return if exists
  //
  utils.getTargetedEl = function (el, className) {
    while (true) {
      // We found it, exit
      if (el.classList.contains(className)) {
        break;
      }
      // Else keep climbing up tree
      if (el = el.parentElement) {
        continue;
      }
      // Not found
      break;
    }
    return el;
  };
  //
  // Return true or false depending on if content
  // is scrollable
  //
  utils.isScrollable = function (el) {
    return el.scrollHeight > el.offsetHeight;
  };
  //
  // Keep scrool from hitting end bounds
  //
  utils.scrollToEnd = function (el) {
    var curPos = el.scrollTop, height = el.offsetHeight, scroll = el.scrollHeight;
    // If at top, bump down 1px
    if (curPos <= 0) {
      el.scrollTop = 1;
    }
    // If at bottom, bump up 1px
    if (curPos + height >= scroll) {
      el.scrollTop = scroll - height - 1;
    }
  };
  // ----------------------------------------------------------------------------
  // Expose
  // ----------------------------------------------------------------------------
  return utils;
}();
/*
 * fix.js
 *
 * (C) 2014 Jarid Margolin
 * MIT LICENCE
 *
 */
var fix;
fix = function (DOMEvent, utils) {
  // ----------------------------------------------------------------------------
  // Fix
  //
  // Class Constructor - Called with new BounceFix(el)
  // Responsible for setting up required instance
  // variables, and listeners.
  // ----------------------------------------------------------------------------
  var Fix = function (className) {
    // Make sure it is created correctly
    if (!(this instanceof Fix)) {
      return new Fix(className);
    }
    // Without className there is nothing to fix
    if (!className) {
      throw new Error('"className" argument is required');
    }
    // Add className to instance
    this.className = className;
    // On touchstart check for block. On end, cleanup
    this.startListener = new DOMEvent(document, 'touchstart', this.touchStart, this);
    this.endListener = new DOMEvent(document, 'touchend', this.touchEnd, this);
  };
  //
  // touchstart handler
  //
  Fix.prototype.touchStart = function (evt) {
    // Get target
    var el = utils.getTargetedEl(evt.target, this.className);
    // If el scrollable
    if (el && utils.isScrollable(el)) {
      return utils.scrollToEnd(el);
    }
    // Else block touchmove
    if (el && !this.moveListener) {
      this.moveListener = new DOMEvent(el, 'touchmove', this.touchMove, this);
    }
  };
  //
  // If this event is called, we block scrolling
  // by preventing default behavior.
  //
  Fix.prototype.touchMove = function (evt) {
    evt.preventDefault();
  };
  //
  // On touchend we need to remove and listeners
  // we may have added.
  //
  Fix.prototype.touchEnd = function (evt) {
    if (this.moveListener) {
      this.moveListener.remove();
      delete this.moveListener;
    }
  };
  //
  // touchend handler
  //
  Fix.prototype.remove = function () {
    this.startListener.remove();
    this.endListener.remove();
  };
  // ----------------------------------------------------------------------------
  // Expose
  // ----------------------------------------------------------------------------
  return Fix;
}(domEvent, utils);
/*
 * bouncefix.js
 *
 * (C) 2014 Jarid Margolin
 * MIT LICENCE
 *
 */
var bouncefix;
bouncefix = function (Fix) {
  // ----------------------------------------------------------------------------
  // Bouncefix
  //
  // Stop full body elastic scroll bounce when scrolling inside
  // nested containers (IOS)
  // ----------------------------------------------------------------------------
  var bouncefix = { cache: {} };
  //
  // Add/Create new instance
  //
  bouncefix.add = function (className) {
    if (!this.cache[className]) {
      this.cache[className] = new Fix(className);
    }
  };
  //
  // Delete/Remove instance
  //
  bouncefix.remove = function (className) {
    if (this.cache[className]) {
      this.cache[className].remove();
      delete this.cache[className];
    }
  };
  // ----------------------------------------------------------------------------
  // Expose
  // ----------------------------------------------------------------------------
  return bouncefix;
}(fix);


return bouncefix;



}));