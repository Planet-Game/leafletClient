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

		swipeThreshold: 0.1
	};

	var sub = {

		id: "",

		scrolling: false,

		sliding: false,

		transitioning: false,

		minY: 0,

		maxY: 0,

		itemIndex: 0,

		itemTx: 0,

		itemWidth: 330,

		bodyWidth: 330,

		borderWidth: 5,

		listHeight: 0,

		minScroll: 10,

		minSliding: 10,

		transTimer: null,

		transDuration: 300
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

		moves: []
	};

	//dom elements
	var $document = $( document ),
		$this,
		$leaf,
		$items,
		$itemHeader,
		$itemBody,
		$itemBodyList,
		$itemBodyListitem,
		$itemBodyButton,
		$selectedPagination,
		$selectedThumbnail,
		$selectedItem,
		$selectedBody,
		$selectedImageButtons,
		$selectedList,
		$selectedListitem,
		$selectedListitems;

	$document.ready( function() {

		leaf.checkDevice();
		leaf.initVars();
		leaf.bindEvents();
		leaf.loadImages( $( ".item-body-listitem:first-child img" ) ); //download first images

		if( leaf.enableAnim ) {
			$leaf.addClass( "enable-anim" );
		} else {
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

			if( version[ 0 ] >= 5  || ( version[ 0 ] >= 4 && version[ 1 ] >= 3 ) ) {
				leaf.enableAnim = true;
			}
		} else if( ua.indexOf( "iPhone") || ua.indexOf( "iPad" ) ) {
			index = ua.indexOf( "OS" ) + 3;
			version = ua.slice( index, index + 3 ).split( "_" ); //[ "7", "0" ]

			if( version[ 0 ] >= 6 ) {
				leaf.enableAnim = true;
			}
		}
	};

	leaf.initVars = function() {
		$body = $( "body" );
		$leaf = $( ".leaf" ).height( window.innerHeight );
		$items = $( ".item" );
		$itemHeader = $( ".item-header" );
		$itemBody = $( ".item-body" );
		$itemBodyList = $( ".item-body-list" );
		$itemBodyListitem = $( ".item-body-listitem" );
		$itemBodyButton = $( ".item-body-button" );

		sub.itemWidth = $itemBodyListitem.width();
	};

	leaf.bindEvents = function() {

		$( ".item-body-listitem img:first" ).load( function() { //to be fixed for coupon images
			leaf.setElements();
			leaf.loadImages( $selectedItem.find( "img" ) );
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

	leaf.loadImages = function( $elems ) {
		var $image;

		$elems.each( function() {
			$image = $( this );

			if( $image.attr( "data-src" ) && $image.attr( "data-src") !== $image.attr( "src" ) ) { //prevent duplicate change
				$image.attr( "src", $image.attr( "data-src" ) );
			}
		});
	};

	leaf.setElements = function() {
		var n;
		$this = $( ".item>.wrap" );
		$selectedItem = $this.parent( ".item" );

		setSelected();

		sub.id = $selectedItem.attr( "id" );

		$( $selectedThumbnail.get( 0 ) ).addClass( "active" );
		if ( $selectedListitems.length >= 6 ) { //highlight next arrow button
			$selectedPagination.addClass( "highlight" );
		}

		$selectedItem.addClass( "selected expand" );//start expand transition

		sub.borderWidth = parseInt( $selectedBody.css( "border-top-width" ), 10 );

		sub.listHeight = ( sub.listHeight !== 0 ) ? sub.listHeight :
			window.innerHeight - $selectedBody.children( ".item-body-button" ).outerHeight() -
			$selectedItem.find( ".wrap .item-header" ).outerHeight() -
			2 * sub.borderWidth;

		$itemBodyList.height( sub.listHeight );

		$selectedImageButtons.css( "top", sub.listHeight / 2 + "px" ); //set prev/next button position dynamically

		$itemBodyButton.each( function() { //set item-body-button size & position dynamically
			$this = $( this );
			n = $this.children( "input" ).length;

			if( n === 1 ) {
				$this.addClass( "single" );
			} else if( n === 2 ) {
				$this.addClass( "double" );
			}
		});

		$body.addClass( "expanded" ); //prepare body for expand transition(overflow-y:hidden)
		sub.bodyWidth = ( $selectedListitems.length - 1 ) * sub.itemWidth;
		sub.maxY = $selectedBody.children( ".check" ).height();
		sub.minY = Math.min( 0, sub.listHeight - $selectedListitem.outerHeight() );

		if( leaf.enableAnim ) {
			sub.itemTx = 0;

			$selectedListitems.addClass( "display" ).each( function() {
				$( this ).data( "tx", sub.itemTx );
				$( this ).css( "-webkit-transform",  "translate3d( " + sub.itemTx + "px, 0, 0 )" );
				sub.itemTx += sub.itemWidth;
			});

			leaf.showImageButtons();
		}

		$selectedListitems.data( "ty", 0 ); //reset ty

		leaf.checkComplete();

		function setSelected() {
			$selectedPagination = $this.find( ".pagination" );
			$selectedThumbnail = $selectedPagination.find( ".thumb" );
			$selectedBody = $this.find( ".item-body" );
			$selectedImageButtons = $selectedBody.children( "button" );
			$selectedList = $this.find( ".item-body-list" );
			$selectedListitems = $selectedList.find( ".item-body-listitem" );
			$selectedListitem = $( $selectedListitems[ 0 ] );
		}
	};

	$document.on( start, function( e ) {

		if( !leaf.animating ) {
			touch.pos = hasTouch? e.originalEvent.touches[ 0 ] : e;
			touch.sx = touch.pos.clientX;
			touch.sy = touch.pos.clientY;
			touch.moves = [];
		}
	});

	$document.on( move, function( e ) {
		e.preventDefault(); //prevent scrolling

		if( !sub.transitioning ) {
			touch.pos = hasTouch? e.originalEvent.changedTouches[ 0 ] : e;
			touch.mx = touch.pos.clientX;
			touch.my = touch.pos.clientY;

			touch.moves.push({
				time: Date.now(), //need to check compability
				x: touch.mx,
				y: touch.my
			});
		}

		if( touch.mx ) {

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
			touch.ty = Math.max( sub.minY, Math.min( sub.maxY, touch.oy + touch.my - touch.sy ) );

			if( leaf.enableAnim ) {
				$selectedListitem.css( "-webkit-transform", "translate3d( " + $selectedListitem.data( "tx" ) + "px, " + touch.ty + "px, 0 )" );
			} else {
				$selectedListitem.css( "-webkit-transform", "translateY( " + touch.ty + "px )" );
			}
		}
	});

	$document.on( end, function( e ) {

		if( $( e.target ).parents( ".item-body-list" ).length === 0 ) {
			return;
		}

		if( $( e.target ).parents( ".selected" ) !== 0 ) {
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

			$document.trigger( jQuery.Event( "beforepagechange", { index: sub.itemIndex } ) );

			touch.tx = touch.ox;
			sub.itemIndex = -touch.ox / sub.itemWidth;
			$selectedListitem.data( "ty", touch.oy );
			$selectedListitem = $( $selectedListitems[ sub.itemIndex ] );
			touch.oy = $selectedListitem.data( "ty" );
			sub.minY = Math.min( 0, $selectedList.innerHeight() - $selectedListitem.innerHeight() );

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

				leaf.showImageButtons();
			} else {
				$selectedListitems.css( "display", "none" );
				$selectedListitem.css( "display", "block" );
			}

			checkActivated();
			checkShifted();
			leaf.checkComplete();

			$document.trigger( jQuery.Event( "afterpagechange", { index: sub.itemIndex } ) );
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

	leaf.showImageButtons = function() {
		clearTimeout( leaf.imageButtonsTimer );

		$selectedImageButtons.css({
			"-webkit-transition": "",
			"opacity":"1"
		});

		leaf.imageButtonsTimer = setTimeout(function() {
			$selectedImageButtons.css({
				"opacity":"0"
			});
		}, 1000 );
	};

	leaf.checkComplete = function() {
		if( sub.itemIndex === $selectedListitems.length - 1 ) {
			$document.trigger( "viewcomplete" );
		}
	};

	leaf.checkIncomplete = function() {
		if( !$selectedItem.hasClass( "complete" ) && sub.itemIndex !== $selectedListitems.length - 1 ) {
			$document.trigger( "viewincomplete" );
		}
	};

	function getHorizontalVelocity() {
		var arr;

		if( touch.moves.length > 1 ) { //not enough moves
			arr = touch.moves.slice( -2 );

			return ( arr[ 1 ].x - arr[ 0 ].x ) / ( arr[ 0 ].time - arr[ 1 ].time );
		}
		return 0;
	}

})( jQuery, window, document );