import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation()

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 처리방침</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>개인정보 처리방침</Text>
          <Text style={styles.lastUpdated}>최종 수정일: 2025년 1월 1일</Text>

          <View style={styles.introSection}>
            <Text style={styles.introText}>
              펌피(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 
              이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 
              수립·공개합니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>1. 개인정보의 처리 목적</Text>
            <Text style={styles.articleContent}>
              회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 
              다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 
              「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.{'\n\n'}
              
              📌 회원 가입 및 관리{'\n'}
              • 회원 가입의사 확인, 회원자격 유지·관리{'\n'}
              • 서비스 부정이용 방지, 각종 고지·통지{'\n\n'}
              
              📌 재화 또는 서비스 제공{'\n'}
              • 물품배송, 서비스 제공, 계약서·청구서 발송{'\n'}
              • 콘텐츠 제공, 맞춤 서비스 제공{'\n'}
              • 본인인증, 요금결제·정산{'\n\n'}
              
              📌 마케팅 및 광고에의 활용{'\n'}
              • 신규 서비스 개발 및 맞춤 서비스 제공{'\n'}
              • 이벤트 및 광고성 정보 제공 및 참여기회 제공{'\n'}
              • 서비스의 유효성 확인, 접속빈도 파악
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>2. 개인정보의 처리 및 보유기간</Text>
            <Text style={styles.articleContent}>
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 
              동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.{'\n\n'}
              
              📋 처리 및 보유기간:{'\n\n'}
              
              • 회원가입 정보: 회원 탈퇴 시까지{'\n'}
              • 결제정보: 5년 (전자상거래법){'\n'}
              • 소비자 불만 또는 분쟁처리 기록: 3년{'\n'}
              • 출석 기록: 회원 탈퇴 후 1년{'\n'}
              • 운동 기록: 회원 탈퇴 시까지{'\n\n'}
              
              단, 다음의 경우에는 해당 기간 종료 시까지:{'\n'}
              • 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우{'\n'}
              • 서비스 이용에 따른 채권·채무관계 잔존 시
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>3. 처리하는 개인정보 항목</Text>
            <Text style={styles.articleContent}>
              회사는 다음의 개인정보 항목을 처리하고 있습니다:{'\n\n'}
              
              📝 필수항목:{'\n'}
              • 이름, 생년월일, 성별{'\n'}
              • 휴대전화번호, 이메일{'\n'}
              • 비밀번호 (암호화 저장){'\n'}
              • 회원권 정보, 결제정보{'\n\n'}
              
              📝 선택항목:{'\n'}
              • 주소, 긴급연락처{'\n'}
              • 신체정보 (키, 체중, 체지방률){'\n'}
              • 건강 특이사항{'\n'}
              • 프로필 사진{'\n\n'}
              
              📝 자동수집 항목:{'\n'}
              • 서비스 이용기록, 접속 로그{'\n'}
              • 쿠키, 접속 IP 정보{'\n'}
              • 기기 정보 (OS, 앱 버전){'\n'}
              • 위치정보 (체육관 출석 확인용)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>4. 개인정보의 제3자 제공</Text>
            <Text style={styles.articleContent}>
              회사는 정보주체의 개인정보를 「1. 개인정보의 처리 목적」에서 명시한 범위 내에서만 
              처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 
              제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.{'\n\n'}
              
              📌 제공받는 자: 결제대행사 (PG사){'\n'}
              • 제공 목적: 결제 처리{'\n'}
              • 제공 항목: 이름, 연락처, 결제정보{'\n'}
              • 보유 기간: 거래 종료 후 5년{'\n\n'}
              
              📌 제공받는 자: 택배사{'\n'}
              • 제공 목적: 상품 배송{'\n'}
              • 제공 항목: 이름, 주소, 연락처{'\n'}
              • 보유 기간: 배송 완료 후 3개월
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>5. 개인정보의 파기</Text>
            <Text style={styles.articleContent}>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
              지체없이 해당 개인정보를 파기합니다.{'\n\n'}
              
              🗑️ 파기절차:{'\n'}
              • 회원이 입력한 정보는 목적 달성 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 
              따라 일정기간 저장된 후 파기됩니다.{'\n\n'}
              
              🗑️ 파기방법:{'\n'}
              • 전자적 파일: 복구 불가능한 방법으로 영구 삭제{'\n'}
              • 종이 문서: 분쇄기로 분쇄하거나 소각
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>6. 정보주체의 권리·의무 및 행사방법</Text>
            <Text style={styles.articleContent}>
              정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:{'\n\n'}
              
              ✅ 개인정보 열람 요구{'\n'}
              ✅ 오류 등이 있을 경우 정정 요구{'\n'}
              ✅ 삭제 요구{'\n'}
              ✅ 처리정지 요구{'\n\n'}
              
              위 권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 
              회사는 이에 대해 지체없이 조치하겠습니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>7. 개인정보 보호책임자</Text>
            <Text style={styles.articleContent}>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:{'\n\n'}
              
              👤 개인정보 보호책임자{'\n'}
              • 성명: 홍길동{'\n'}
              • 직책: CTO{'\n'}
              • 이메일: privacy@pumpy.com{'\n'}
              • 전화: 02-1234-5678{'\n\n'}
              
              정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 
              불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>8. 개인정보의 안전성 확보조치</Text>
            <Text style={styles.articleContent}>
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:{'\n\n'}
              
              🔒 관리적 조치:{'\n'}
              • 내부관리계획 수립·시행{'\n'}
              • 정기적 직원 교육{'\n'}
              • 개인정보 취급자 최소화 및 교육{'\n\n'}
              
              🔒 기술적 조치:{'\n'}
              • 개인정보 암호화{'\n'}
              • 해킹 등에 대비한 보안프로그램 설치{'\n'}
              • 접근권한 관리{'\n'}
              • 접속기록 보관 및 점검{'\n\n'}
              
              🔒 물리적 조치:{'\n'}
              • 전산실, 자료보관실 등의 접근통제
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>9. 개인정보 자동 수집 장치의 설치·운영 및 거부</Text>
            <Text style={styles.articleContent}>
              회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 
              수시로 불러오는 '쿠키(cookie)'를 사용합니다.{'\n\n'}
              
              🍪 쿠키란?{'\n'}
              • 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보{'\n'}
              • 이용자들의 PC 컴퓨터내의 하드디스크에 저장되기도 함{'\n\n'}
              
              🍪 쿠키의 사용 목적:{'\n'}
              • 이용자의 접속빈도나 방문시간 등을 분석{'\n'}
              • 이용자의 취향과 관심분야를 파악 및 자취 추적{'\n'}
              • 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타겟 마케팅 및 개인 맞춤 서비스 제공{'\n\n'}
              
              🍪 쿠키의 설정 거부 방법:{'\n'}
              • 웹브라우저 옵션 설정을 통해 쿠키 허용/차단 가능{'\n'}
              • 단, 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있음
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>10. 개인정보 처리방침 변경</Text>
            <Text style={styles.articleContent}>
              이 개인정보 처리방침은 2025년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 
              추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 
              고지할 것입니다.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerTitle}>📞 개인정보 침해 신고·상담</Text>
            <Text style={styles.footerText}>
              개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하시기 바랍니다:{'\n\n'}
              
              • 개인정보 침해신고센터{'\n'}
              (국번없이) 118{'\n'}
              privacy.kisa.or.kr{'\n\n'}
              
              • 대검찰청 사이버범죄수사단{'\n'}
              (국번없이) 1301{'\n'}
              cybercid.spo.go.kr{'\n\n'}
              
              • 경찰청 사이버안전국{'\n'}
              (국번없이) 182{'\n'}
              cyberbureau.police.go.kr
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: { color: 'white', fontSize: 24, fontWeight: '800' },
  headerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  contentCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 25
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center'
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 25
  },
  introSection: {
    backgroundColor: '#f0f4ff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea'
  },
  introText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#555'
  },
  section: {
    marginBottom: 25
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 12
  },
  articleContent: {
    fontSize: 14,
    lineHeight: 24,
    color: '#555'
  },
  footer: {
    marginTop: 30,
    paddingTop: 25,
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fffbf0',
    padding: 20,
    borderRadius: 15
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginBottom: 12
  },
  footerText: {
    fontSize: 13,
    lineHeight: 24,
    color: '#666'
  }
})

