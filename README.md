[개요]
- Title: leaflet client for Syrup store
- Owner: Wook Shim (wshim@sk.com)
- License: SK planet wholly owned

[저장소]
- https://github.com/wshim/leafletClient
- CNT에서 사내 소스 접근이 가능한지 확인 중이나 일단 github로 배포 진행하겠습니다.

[파일 구성]
- index.html: 마크업 샘플(컨텐츠 개수는 추가/제거 가능하나 구조는 변경하시면 안됩니다.)
- ocb.html: 단말의 ocb webview에서 테스트 가능하도록 redirection 해주는 마크업(단말 브라우저로 해당 페이지를 열명 자동으로 OCB App 구동됨, ip 주소는 웹서버에 맞게 변경 필요)
- animation.js: 애니메이션을 처리하는 js 모듈(저희가 관리하는 코드이므로 CNT에서 수정하시면 안됩니다.)
- Interface.js: 연동 관련 코드를 작성할 js파일(연동 샘플 코드가 들어있으며, CNT에서 필요한 스크립트는 이 파일에 추가하시면 됩니다.)
- resources/css: css 폴더(default.css, normalize.css는 수정하지 마시고, 필요한 css 파일이 있으시면 별도로 추가하여 작업 부탁드립니다.)
- Resources/img: 이미지 리소스 폴더(마크업에 따라 수정하셔도 무방합니다.)

[연동 방식]
- 하단 공통 버튼(전화걸기, 매장보기, 스크랩하기), 쿠폰 받기 버튼, 방문 및 바코드 확인 버튼: click event binding 방식
- 적립 관련 아이콘 및 메시지(적립 완료, 적립 미완료) 처리: custom event binding 방식
- 상세 내용은 interface.js 샘플 코드 확인 요망
- 기타 연동이 필요한 기능은 별도 요청

[기타]
- 아직 초기 코드이므로 최적화가 필요하며 class, id, event name 등은 변동의 소지가 있으니 작업에 참고하시기 바랍니다.
- 갤럭시S3에 최적화되어 있으며 일부 단말에서는 폰트 크기가 비정상적이거나 화면이 깨지는 등의 문제가 있습니다.
- 현 버전은 구형 OS에서 정상 동작하지 않을 수 있으며 Andriod 4.3 이상, iOS 6 이상에 대해서만 애니메이션 지원 예정입니다.
- 상용 배포 시에는 animation.js와 interface.js 통합 및 minify 작업이 필요합니다.

[v 0.7 수정사항, 2014/11/8]
- 쿠폰 페이지 추가(index.html의 #section-1에서 2번째 전단페이지에 샘플 추가)
- iOS 대응(스크롤러 버그 대응, 각종 분기 처리 및 관련 마크업 수정)
- 애니메이션 미지원 단말 대응코드 적용(CSS transition 제거)
- 전단페이지 버튼 이동기능 적용
- 기타 애니메이션 관련 코드 안정화

[v 0.9 수정사항, 2014/11/11]
- Lazyload 기능 구현(document ready 후 data-url을 src url로 순차적으로 변경)
- 매장 전단 별도페이지 제작(index-sub.html, animation-sub.js, interface-sub.js, resources/css/default-sub.css)
- 애니메이션 미지원 단말 분기코드 안정화(subpage scroll을 제외한 CSS transform까지 완전 제거)
- 1차 내부 QA 관련 버그 수정 및 안정화(CSS 오류, 스크롤러 관련 오류, 성능 최적화 등)
- 쿠폰 페이지 마크업 수정(깨진 마크업 복구)

[v 0.92 수정사항, 2014/11/14]
- 매장 전단 높이값의 동적 대응 기능 적용(매장 전단이 화면 높이에 꽉 차도록 기기별로 자동 조정)
- 방문확인 및 바코드 확인 관련 신규 디자인 적용(클릭 시 아이콘 변경 기능 포함하여 매장 전단 상단에 추가)
- 쿠폰 페이지 오류 수정(쿠폰 받기 버튼 디자인 복구)
- 적립 미완료 메시지 토스트 형태로 수정(화면 상단에서 약 1초간 노출 후 사라짐)
- interface.js 파일 수정(애니메이션 시작/종료 관련 이벤트 예제 추가, 적립 미완료 메시지 노출 예제 추가, 쿠폰 매장 정보 확인 예제 추가 등)
- 상기 수정사항의 매장 전단 별도 페이지 반영(index-sub.html, animation-sub.js, interface-sub.js, resources/css/default-sub.css)
- normalize.css 제거
- 기타 디자인 관련 사항 수정(css rem 값 수정, 적립 완료 시 헤더 메시지 변경 기능 추가, 립 완료 아이콘 이미지 추가 및 투명도 조절 등)

[v 0.95 수정사항, 2014/11/20]
- 매장 전단 버튼 개수 변화에 대응한 동적 레이아웃 적용(상단 방문/바코드 확인 및 하단 버튼)
- 매장 전단 페이지 전환 버튼 동적 포지셔닝 기능 적용
- 서버 연동 관련 이벤트 및 페이지 번호 등의 이벤트 객체 전달기능 추가(페이지 전환, 매장 전단 진입/진출 등, interface.js 참조)
- 이미지 다운로드 로직 개선(상권 전단에서는 첫번째 이미지만 다운로드하고 매장 전단 진입 시에 페이지 이미지 전체 다운로드)
- 이미지 링크 디자인 변경에 따른 버튼 마크업 및 샘플 코드 추가(btn-link)
- 쿠폰 다운로드 완료 디자인 변경에 따른 버튼 색상 변경 기능 추가(짙은 주황)
- 애니메이션 미지원 단말 레이아웃 개선을 통한 성능 향상(화면에 표시되지 않는 객체 전체에 대해 visibility:hidden 대신 display:none 적용)
- 터치 이벤트 오동작 방지코드 삽입(매장 전단 진입 시 touchend event에 preventDefault 상시 적용)
- 상기 수정사항의 매장 전단 별도 페이지 반영

[v 0.98 수정사항, 2014/11/25]
- 매장 전단 리프레시 기능 추가(document에 beforerefresh 이벤트 전달 후 새창 띄우면 URL에 관련 정보 저장해두었다가 리프레시 시점에 기존 매장 전단 페이지를 보여주는 부분을 모두 클라이언트에서 처리하므로 서버에서는 방문 확인 등의 작업만 필요)
- 상기 기능 관련 예제 추가(interface.js의 .link-coupon, .check-visit, .check-barcode 예제 확인 요망. button이 아닌 a-link의 경우 마크업에 해당 URL 삽입 필요)
- 상권 전단 복귀 및 매장 전단 재진입 시 보던 페이지를 유지하는 기능 추가(scroll 성능 문제 없도록 transform 제거하고 display:block 속성 사용)
- UX 관련 요청 사항 수정(적립 완료 애니메이션, 폰트 크기/위치/자간, 버튼 컬러 및 간격, 썸네일 좌우 화살표 색상 변경 시점 등)