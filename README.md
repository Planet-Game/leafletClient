Title: leaflet client for Syrup store
Owner: Wook Shim (wshim@sk.com)
License: SK planet wholly owned

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