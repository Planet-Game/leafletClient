/*
 * leaflet client animator interface (sample codes)
 * Owner: Wook Shim (wshim@sk.com)
 * License: SK planet wholly owned
 */

(function( $, window, document, undefined ) {

	var $document = $( document );

	$document.ready(function() {
		//매장 전단 하단 버튼 연동 샘플(전화걸기, 매장보기, 스크랩하기)
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

		//이미지 하단 바로 가기 링크 버튼 연동 샘플
		$( ".link-img" ).on( "click", function( e ) {
			if( $( this ).parents( ".expand" ).length !== 0 ) { //확대된 상태에서만 버튼 동작
				e.stopPropagation(); //shrink 동작 방지
				alert( "바로 가기" );
			}
		});

		//쿠폰 내 제품정보 보러가기 버튼 연동 샘플
		$( ".link-coupon" ).on( "click", function( e ) {
			if( $( this ).parents( ".expand" ).length !== 0 ) { //확대된 상태에서만 버튼 동작
				e.stopPropagation(); //shrink 동작 방지
				// e.preventDefault(); //a href="#" 일 경우 shrink 발생하므로 이를 방지하려면 사용할 것(외부 링크 사용 시 불필요)
				alert( "제품정보" );
			}
		});
		//쿠폰 받기 버튼 연동 샘플
		$( ".btn-coupon" ).on( "click", function( e ) {
			if( $( this ).parents( ".expand" ).length !== 0 ) { //확대된 상태에서만 버튼 동작
				e.stopPropagation(); //shrink 동작 방지
				$( this ).addClass( "complete" );
				alert( "쿠폰받기" );
			}
		});


		//방문확인 버튼 연동 샘플
		$( ".check-visit" ).on( "click", function( e ) {
			e.stopPropagation(); //shrink 동작 방지
			alert( "방문확인" );
			$( this ).addClass( "after" ); //방문확인 완료 아이콘 및 메시지 표시
		});

		$( ".check-barcode" ).on( "click", function( e ) {
			e.stopPropagation(); //shrink 동작 방지
			alert( "바코드확인" );
			$( this ).addClass( "after" ); //바코드확인 완료 아이콘 및 메시지 표시
		});


		//적립 완료 및 미완료 이벤트 처리 샘플
		$document.on( "viewcomplete", function( e ) { //적립완료 알림
			$( ".item.selected" ).addClass( "complete" ); //적립완료 레이어 표시
			// $( ".item.selected" ).removeClass( "complete" ); //숨기고 싶을 때
			console.log( "적립완료" );
		});

		$document.on( "viewincomplete", function( e ) { //적립 미완료 알림
			$( ".point-missed" ).addClass( "show" ); //적립 미완료 토스트 메시지 표시
			console.log( "적립미완료" );
		});


		//상권전단에서 매장전단으로 진입, 매장전단에서 상권전단으로 복귀 관련 이벤트 처리 샘플
		$document.on( "beforeexpand", function( e ) { //매장 전단 진입 전(페이지 전환 전)
			var id = e.id; //매장 전단 id
			console.log( "매장전단 진입전: " + id );

			$( ".point-missed" ).removeClass( "show" );
		});

		$document.on( "afterexpand", function( e ) { //매장 전단 진입 후(페이지 전환 후)
			var id = e.id; //매장 전단 id
			console.log( "매장전단 진입후: " + id );
		});

		$document.on( "beforeshrink", function( e ) { //매장 전단 진입 전(페이지 전환 전)
			var id = e.id; //매장 전단 id
			console.log( "매장전단 진출전: " + id );

			$( ".point-missed" ).removeClass( "show" );
		});

		$document.on( "aftershrink", function( e ) { //매장 전단 진입 후(페이지 전환 후)
			var id = e.id; //매장 전단 id
			console.log( "매장전단 진출후: " + id );
		});


		//매장 전단 페이지 전환 이벤트 처리 샘플
		$document.on( "beforepagechange", function( e ) { //매장 전단 페이지 전환 직전(전환 전 페이지 인덱스 반환)
			var pageNumber = e.index; //페이지번호
			console.log( "이전페이지: " + pageNumber );
		});

		$document.on( "afterpagechange", function( e ) { //매장 전단 페이지 전환 직후(전환 후 페이지 인덱스 반환)
			var pageNumber = e.index; //페이지번호
			console.log( "현재페이지: " + pageNumber );
		});
	});

})( jQuery, window, document );