/*
 * leaflet client animator interface (sample codes)
 * Owner: Wook Shim (wshim@sk.com)
 * License: SK planet wholly owned
 */

(function( $, window, document, undefined ) {

	$( document ).ready(function() {
		//하단 버튼 연동(전화걸기, 매장보기, 스크랩하기)
		$( ".btn-call" ).on( "click", function( e ) {
			e.stopPropagation(); //shrink 동작 방지
			alert( "전화걸기" );
		});

		$( ".btn-view" ).on( "click", function( e ) {
			e.stopPropagation(); //shrink 동작 방지
			alert( "매장보기" );
		});

		$( ".btn-scrap" ).on( "click", function( e ) {
			e.stopPropagation(); //shrink 동작 방지
			alert( "스크랩하기" );
		});

		//쿠폰 받기 버튼
		$( ".btn-coupon" ).on( "click", function( e ) {
			if( $( this ).parents( ".expand" ).length !== 0 ) { //확대된 상태에서만 버튼 동작
				e.stopPropagation(); //shrink 동작 방지
				alert( "쿠폰받기" );
			}
		});

		//방문확인 버튼
		$( ".check-visit" ).on( "click", function( e ) {
			e.stopPropagation(); //shrink 동작 방지
			alert( "방문확인" );
		});

		$( ".check-barcode" ).on( "click", function( e ) {
			e.stopPropagation(); //shrink 동작 방지
			alert( "바코드확인" );
		});


		//적립 관련 아이콘 및 메시지 보여주기(적립 완료, 적립 미완료)
		$( document ).on( "viewComplete", function( e ) { //적립완료
			$( ".item.selected" ).addClass( "complete" );
			// $( ".item.selected" ).removeClass( "complete" ); //숨기고 싶을 때
			console.log("적립완료");
		});

		// $( document ).on( "viewIncomplete", function( e ) { //적립 미완료
		// 	$( ".item.selected" ).removeClass( "complete" );
		// 	alert( "적립이 완료되었습니다." );
		// });
	});

})( jQuery, window, document );