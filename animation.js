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

		enable3D: false
	};

	var main = {

		expanded: false,

		flipping: false, //necessary?

		scrollTop: 0,

		transDuration: 700,

		flipInterval: null
	};

	var sub = {

		scrolling: false,

		sliding: false,

		itemIndex: 0,

		itemTx: 0,

		itemWidth: 330,

		bodyWidth: 330,

		minScroll: 20,

		minSliding: 40,

		transTimer: null
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
		$body,
		$leaf,
		$leafHeader,
		$leafFooter,
		$items,
		$itemHeader,
		$itemBody,
		$itemBodyList,
		$itemBodyListitem,
		$itemPage,
		$flipArea,
		$itemFooter,
		$leafFooter,
		$selectedPagination,
		$selectedThumbnail,
		$selectedItem,
		$selectedBody,
		$selectedList,
		$selectedListitem,
		$selectedListitems,
		$selectedItemFooter;


	$document.ready( function() {

		checkDevice();
		initVars();

		if( leaf.enable3D ) {
			bindEvent();
			setFlipInterval();
		}
	});

	function checkDevice() { //support 3d animation for Android 4.2 and iOS 6 or above
		var ua = navigator.userAgent,
			index,
			version;

		if( ua.indexOf( "Android" ) !== -1 ) {
			index = ua.indexOf( "Android" ) + 8;
			version = ua.slice( index, index + 3 ).split( "." ); //[ "4", "3" ]

			if( version[ 0 ] >= 4 && version[ 1 ] >= 2 ) {
				leaf.enable3D = true;
			}
		} else if( ua.indexOf( "iPhone") || ua.indexOf( "iPad" ) ) {
			index = ua.indexOf( "OS" ) + 3;
			version = ua.slice( index, index + 3 ).split( "_" ); //[ "7", "0" ]

			if( version[ 0 ] >= 6 ) {
				leaf.enable3D = true;
			}
		}

		leaf.enable3D = true;//temporary code for test
	}

	function initVars() {
		$body = $( "body" );
		$leaf = $( ".leaf" );
		$leafHeader = $( ".leaf-header" );
		$leafFooter = $( ".leaf-footer" );
		$items = $( ".item" );
		$itemHeader = $( ".item-header" );
		$itemBody = $( ".item-body" );
		$itemBodyList = $( ".item-body-list" );
		$itemPage = $( ".item-page" );
		$flipArea = $( ".flip-area" );
		$itemFooter = $( ".item-footer" );
		$leafFooter = $( ".leaf-footer" );
		$itemBodyListitem = $( ".item-body-listitem" );

		sub.itemWidth = $itemBodyListitem.width();
		flip.playQueue = new AnimQueue();
	}

	function bindEvent() {
		$( ".item>a" ).on( "click", function( e ){
			e.preventDefault();

			if( !leaf.animating ) {
				leaf.animating = true;

				$this = $( this );
				$selectedItem = $this.parent( ".item" );

				if( !main.expanded ) {
					expandItem();
				} else {
					shrinkItem();
				}
			}
		});
	}

	function flipInterval() {
		if( touch.scrolls.length > 20 ) {
			touch.scrolls = touch.scrolls.slice( -5 );
		}

		touch.scrolls.push({
			time: Date.now(),
			scroll: $document.scrollTop()
		});

		if( getScrollVelocity() > 0.1 ) {
			flip.playQueue.start();
		}
	}

	function setFlipInterval() {
		main.flipInterval = setInterval( flipInterval, 100 );
	}

	function clearFlipInterval() {
		touch.scrolls = [];
		clearInterval( main.flipInterval );
	}

	function locate3d() {
		$selectedItem.prevAll( ".item" ).css( "opacity", "0" );
		$selectedItem.nextAll( ".item" ).each(function() {
			var $item = $( this );

			$item.data( "ty", $item.offset().top ).css({
				"-webkit-transform": "translateY(" + $item.offset().top + "px)"
			});
		});

		$selectedItem.nextAll( ".item" ).addClass( "enable3d" ).each(function() {
			var $item = $( this );

			$item.css({
				"-webkit-transition": "-webkit-transform 1s",
				"-webkit-transform": "translateY(" + ( $item.offset().top + 1.4 * $item.height() ) + "px)"
			});
		});
	}

	function expandItem( nohash ) {
		main.expanded = true;

		clearFlipInterval();

		leaf.scrollTop = $this.offset().top;

		$body.animate({
				scrollTop: leaf.scrollTop
			}, 200,
			function() {
				$selectedPagination = $this.find( ".pagination" );
				$selectedThumbnail = $selectedPagination.find( ".thumb" );
				$selectedBody = $this.find( ".item-body" );
				$selectedList = $this.find( ".item-body-list" );
				$selectedListitems = $selectedList.find( ".item-body-listitem" );
				$selectedListitem = $( $selectedListitems[ 0 ] );
				$selectedItemFooter = $this.find( ".item-footer" );

				locate3d(); //for 3d animation

				$( $selectedThumbnail.get( 0 ) ).addClass( "active" );
				if ( $selectedListitems.length >= 6 ) { //highlight next arrow button
					$selectedPagination.addClass( "highlight" );
				}

				$selectedItem.addClass( "selected expand" );//start expand transition
				// $items.not( ".selected" ).css( "opacity", "0" ); //hide other leaflets

				$leafFooter.css({
					"padding-bottom": "100%"
				});

				if( !nohash ) {
					location.hash = $this.attr( "href" ); //update hash history
				}

				$body.scrollTop( leaf.scrollTop );

				$selectedItemFooter.css({
				    "-webkit-transition": "-webkit-transform " + ( main.transDuration / 1000 ) + "s",
				    "-webkit-transform": "translateY(99%)"
				});

				setTimeout( function() {
					$body.addClass( "expanded" ); //prepare body for expand transition(overflow-y:hidden)

					sub.bodyWidth = ( $selectedListitems.length - 1 ) * sub.itemWidth;
					sub.itemTx = 0;

					$selectedListitems.addClass( "display" ).each( function() {
						$( this ).data( "tx", sub.itemTx );
						$( this ).css( "-webkit-transform",  "translate3d( " + sub.itemTx + "px, 0, 0 )" );
						sub.itemTx += sub.itemWidth;
					});

					leaf.animating = false;

				}, main.transDuration );

			}
		);

	}

	function unlocate3d() {
		$selectedItem.nextAll( ".item" ).each(function() {
			var $item = $( this );

			$item.css({
				"-webkit-transform": "translateY(" + $item.data( "ty" ) + "px)"
			});
		});
	}

	function shrinkItem( nohash ) {
		touch.ox = 0; //reset list-item position

		unlocate3d();

		$body.removeClass( "expanded" );

		//shrink transition(reverse of expand)
		$selectedList.css( "-webkit-transform", "translate3d( 0, 0, 0 )" );
		$selectedListitems.removeClass( "display" ); //hide list-item
		$selectedThumbnail.removeClass( "active" );

		$selectedItem.removeClass( "selected" );

		$selectedItemFooter.css({
		    "-webkit-transform": "translateY(54.3%)"
		});

		if( !nohash ) {
			location.hash = ""; //update hash history
		}

		$body.scrollTop( leaf.scrollTop ); //recover scrollTop changed by empty hash

		$leafFooter.css({
			"padding-bottom": "10%"
		});

		setTimeout( function() {

			$items.removeClass( "enable3d" ).css({
				"-webkit-transition": "",
				"-webkit-transform": ""
			});

			$selectedItemFooter.css({
			    "-webkit-transition": "",
			    "-webkit-transform": ""
			});

			$selectedItem.removeClass( "expand" );
			$items.not( ".selected" ).css( "opacity", "1" );

			$selectedListitems = null;
			$selectedList = null;
			$selectedItemFooter = null;
			main.expanded = false;
			leaf.animating = false;

			setFlipInterval();

			$selectedItem.addClass( "visited" );

		}, main.transDuration * 1.3 );
	}

	$( window ).on( "hashchange", function() {
		console.log( "hash" + location.hash );
		if( !leaf.animating ) { //hashchange by back button
			if( location.hash === "" ) {
				shrinkItem( true );
			} else {
				$selectedItem = $( location.hash );
				$this = $selectedItem.children( "a" );
				expandItem( true );
			}
		}
	});

	$document.on( start, function( e ) {

		if( !leaf.animating ) {
			touch.pos = hasTouch? e.originalEvent.touches[ 0 ] : e;
			touch.sx = touch.pos.clientX;
			touch.sy = touch.pos.clientY;
			touch.moves = [];

			if ( !main.expanded ) {
				touch.scrolls = [];
				touch.scrolls.push({
					time: e.timeStamp,
					scroll: $document.scrollTop()
				});
			}
		}
	});

	$document.on( move, function( e ) {

		if( !leaf.animating ) {
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

			if( $( e.target ).parents( ".item-body-list" ).length !== 0 ) { //subpage swipe & scroll

				if( sub.sliding === false ) {
					if( sub.scrolling ) {
						subScroll();
					} else {
						if( Math.abs( touch.sy - touch.my ) > sub.minScroll ) { //enable vertical scroll
							sub.scrolling = true;
						} else if( Math.abs( touch.mx - touch.sx ) > sub.minSliding ) {
							sub.sliding = touch.mx;
							// $selectedListitems.addClass( "sliding" );
						}
					}
				} else {
					touch.tx = Math.max( -sub.bodyWidth, Math.min( touch.ox + touch.mx - sub.sliding, 0 ) );
					$selectedList.css( "-webkit-transform", "translate3d( " + touch.tx + "px, 0, 0 )" );
				}
			}
		}

		function subScroll() {
			var maxY = 0,
				minY = $selectedBody.innerHeight() - $selectedListitem.innerHeight();

			touch.ty = Math.max( minY, Math.min( 0, touch.oy + touch.my - touch.sy ) );
			$selectedListitem.css( "-webkit-transform", "translate3d( " + $selectedListitem.data( "tx" ) + "px, " + touch.ty + "px, 0 )" );
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

				if( touch.vx > 0.1 ) { //swipe left by velocity
					touch.ox = Math.max( touch.ox - sub.itemWidth, -sub.bodyWidth );
				}
				else if( touch.vx < -0.1 ) { //swipe right by velocity
					touch.ox = Math.min( touch.ox + sub.itemWidth, 0 );
				} else { //swipe by horizontal diff
					touch.ox = -Math.round( -touch.tx / sub.itemWidth ) * sub.itemWidth;
				}

				if( touch.ox !== touch.tx ) {

					clearTimeout( sub.transTimer );

					$selectedList.css({
						"-webkit-transition": "-webkit-transform 0.4s",
						"-webkit-transform": "translate3d(" + touch.ox + "px, 0, 0 )"
					});

					sub.itemIndex = -touch.ox / sub.itemWidth;
					$selectedListitem = $( $selectedListitems[ sub.itemIndex ] );

					checkActivated();
					checkShifted();
					checkCompleted();

					sub.transTimer = setTimeout( function() {
						$selectedList.css( "-webkit-transition", "" );

					}, 500);
				}
			}

			sub.sliding = false;
			sub.scrolling = false;
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

		function checkCompleted() {
			if( sub.itemIndex === $selectedListitems.length - 1 ) {
				$document.trigger( "viewComplete" );
			}
		}
	});

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

	function getVerticalVelocity( moves ) {
		var m;

		if( moves.length > 1 ) { //not enough moves
			m = moves.slice( -2 );

			return ( m[ 1 ].y - m[ 0 ].y ) / ( m[ 0 ].time - m[ 1 ].time );
		}
		return 0;
	}

	//For animation control using queue
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

		start: function() {
			if( flip.playStatus === "idle" ) {
				this.enqueue( new Player( "forward", flip.frameDuration, flip.totalDuration / 2, 0, 12, "up" ) );
				this.enqueue( new Player( "forward", flip.frameDuration, flip.totalDuration / 2, 12, 24, "down" ) );
				play( this.dequeue() );
			} else if( flip.playStatus === "down" && $document.scrollTop() > 0 ) {
				this.stop();
				this.enqueue( new Player( "backward", flip.frameDuration / 4, ( flip.currentFrame - 13 ) * flip.frameDuration / 4, flip.currentFrame - 1, 13, "reverse" ) );
				this.enqueue( new Player( "none", flip.frameDuration, 200, 12, 12, "hold" ) );
				this.enqueue( new Player( "forward", flip.frameDuration, flip.totalDuration / 2, 13, 24, "down" ) );
			}
		},

		stop: function() {
			clearInterval( flip.interval );
			flip.playQueue.elems = [];
		},

		next: function() {
			if( flip.playQueue.size() !== 0 ) {
				play( flip.playQueue.dequeue() );
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

	function setFrame( index ) {
		$flipArea.css( "background-position", "0% " + 100 * index / ( flip.frameLength - 1 ) + "%" );
	}

	function play( player ) {
		flip.currentFrame = player.from;
		setFrame( flip.currentFrame );
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
					setFrame( flip.currentFrame );
				}
			}, player.interval );
		}

		setTimeout(function() {
			clearInterval( flip.interval );
			flip.playQueue.next();
		}, player.duration );
	}

	function stop( delay, callback ) {
		setTimeout(function() {
			clearInterval( flip.interval );
			if( callback ) callback();
		}, delay );
	}

	function forward( duration ) {
		flip.interval = setInterval(function() {
			flip.currentFrame = ( flip.currentFrame + 1 ) % 25;
			setFrame( flip.currentFrame )
		}, flip.frameDuration );

		stop( duration || ( frameLength - flip.currentFrame - 1 ) * flip.frameDuration );
	}

	function backward( toFrame, callback ) {
		if( flip.currentFrame > 12 ) { //no need to play backward
			toFrame = toFrame || 12;

			flip.interval = setInterval(function() {
				if( flip.currentFrame !== toFrame ) {
					flip.currentFrame = ( flip.currentFrame - 1 ) % 25;
					setFrame( flip.currentFrame );
				}
			}, flip.frameDuration * 0.3 );

			stop( ( flip.currentFrame - toFrame ) * flip.frameDuration * 0.3 + 200, forward );
		}
	}
})( jQuery, window, document );