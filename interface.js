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

		//제품정보 보러가기 버튼
		$( ".link-coupon" ).on( "click", function( e ) {
			if( $( this ).parents( ".expand" ).length !== 0 ) { //확대된 상태에서만 버튼 동작
				e.stopPropagation(); //shrink 동작 방지
				// e.preventDefault(); //a href="#" 일 경우 shrink 발생하므로 이를 방지하려면 사용할 것(외부 링크 사용 시 불필요)
				alert( "제품정보" );
			}
		});

		//방문확인 버튼
		$( ".check-visit" ).on( "click", function( e ) {
			e.stopPropagation(); //shrink 동작 방지
			alert( "방문확인" );
			$( this ).addClass( "after" );
		});

		$( ".check-barcode" ).on( "click", function( e ) {
			e.stopPropagation(); //shrink 동작 방지
			alert( "바코드확인" );
			$( this ).addClass( "after" );
		});


		//적립 관련 아이콘 및 메시지 보여주기(적립 완료, 적립 미완료)
		$( document ).on( "viewcomplete", function( e ) { //적립완료 알림
			$( ".item.selected" ).addClass( "complete" );
			// $( ".item.selected" ).removeClass( "complete" ); //숨기고 싶을 때
			console.log("적립완료");
		});

		$( document ).on( "viewincomplete", function( e ) { //적립 미완료 알림
			$( ".point-missed" ).addClass( "show" );
			console.log("적립미완료");
		});

		$( document ).on( "beforeexpand", function( e ) { //확대 애니메이션 알림
			$( ".point-missed" ).removeClass( "show" );
		});
	});

})( jQuery, window, document );