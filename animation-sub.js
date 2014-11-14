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

		enableAnim: false,

		scrollThreshold: 0.1,

		swipeThreshold: 0.1
	};

	var sub = {

		scrolling: false,

		sliding: false,

		transitioning: false,

		itemIndex: 0,

		itemTx: 0,

		minY: 0,

		maxY: 0,

		itemWidth: 330,

		bodyWidth: 330,

		listHeight: 0,

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

	//dom elements
	var $document = $( document ),
		$this,
		$leaf,
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
		leaf.setElements();

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
		$leaf = $( ".leaf" ).height( window.innerHeight );
		$items = $( ".item" );
		$itemHeader = $( ".item-header" );
		$itemBody = $( ".item-body" );
		$itemBodyList = $( ".item-body-list" );
		$flipArea = $( ".flip-area" );
		$itemFooter = $( ".item-footer" );
		$itemBodyListitem = $( ".item-body-listitem" );

		sub.itemWidth = $itemBodyListitem.width();
	};

	leaf.bindEvents = function() {

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
	};

	leaf.loadImages = function() {

		changeDataSrc( ".item-body-listitem img:first" ); //first image
		changeDataSrc( ".pagination ol img" ); //thumbnail images
		changeDataSrc( ".item-body-listitem img" ); //remaining images

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

	leaf.setElements = function() {
		$this = $( ".item>.wrap" );

		setSelected();

		$( $selectedThumbnail.get( 0 ) ).addClass( "active" );
		if ( $selectedListitems.length >= 6 ) { //highlight next arrow button
			$selectedPagination.addClass( "highlight" );
		}

		$selectedItem.addClass( "selected expand" );//start expand transition

		$body.addClass( "expanded" ); //prepare body for expand transition(overflow-y:hidden)
		sub.bodyWidth = ( $selectedListitems.length - 1 ) * sub.itemWidth;

		if( leaf.enableAnim ) {
			sub.itemTx = 0;

			$selectedListitems.addClass( "display" ).each( function() {
				$( this ).data( "tx", sub.itemTx );
				$( this ).css( "-webkit-transform",  "translate3d( " + sub.itemTx + "px, 0, 0 )" );
				sub.itemTx += sub.itemWidth;
			});
		}

		$selectedListitems.data( "ty", 0 ); //reset ty

		if( sub.listHeight === 0 ) {
			sub.listHeight = ( sub.listHeight !== 0 ) ? sub.listHeight :
				( window.innerHeight - $selectedBody.children( ".item-body-button" ).outerHeight() -
					$selectedItem.find( ".wrap .item-header" ).outerHeight() -
					2 * parseInt( $selectedBody.css( "border-top-width" ), 10 ) );

			$( ".item-body-list" ).height( sub.listHeight );
		}

		sub.maxY = $selectedBody.children( ".check" ).height();
		sub.minY = Math.min( 0, $selectedList.innerHeight() - $selectedListitem.innerHeight() );

		leaf.checkComplete();

		function setSelected() {
			$selectedItem = $this.parent( ".item" );
			$selectedPagination = $this.find( ".pagination" );
			$selectedThumbnail = $selectedPagination.find( ".thumb" );
			$selectedBody = $this.find( ".item-body" );
			$selectedList = $this.find( ".item-body-list" );
			$selectedListitems = $selectedList.find( ".item-body-listitem" );
			$selectedListitem = $( $selectedListitems[ 0 ] );
			$selectedItemFooter = $this.find( ".item-footer" );
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
			// e.preventDefault();
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
			} else {
				$selectedListitems.css( "display", "none" );
				$selectedListitem.css( "display", "block" );
			}

			checkActivated();
			checkShifted();
			leaf.checkComplete();
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

})( jQuery, window, document );