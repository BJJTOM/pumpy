import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'

export default function TermsOfServiceScreen() {
  const navigation = useNavigation()

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이용약관</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>펌피 서비스 이용약관</Text>
          <Text style={styles.lastUpdated}>최종 수정일: 2025년 1월 1일</Text>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제1조 (목적)</Text>
            <Text style={styles.articleContent}>
              본 약관은 펌피 (이하 "회사")가 제공하는 피트니스 센터 및 관련 서비스(이하 "서비스")의 이용과 관련하여 
              회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제2조 (정의)</Text>
            <Text style={styles.articleContent}>
              본 약관에서 사용하는 용어의 정의는 다음과 같습니다:{'\n\n'}
              
              1. "서비스"란 회사가 제공하는 피트니스 센터 이용 및 관련 부가 서비스를 의미합니다.{'\n\n'}
              
              2. "회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.{'\n\n'}
              
              3. "회원권"이란 회원이 서비스를 이용할 수 있는 자격을 의미합니다.{'\n\n'}
              
              4. "개인정보"란 생존하는 개인에 관한 정보로서 해당 정보에 포함된 성명, 생년월일, 연락처 등으로 
              개인을 식별할 수 있는 정보를 의미합니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제3조 (약관의 효력 및 변경)</Text>
            <Text style={styles.articleContent}>
              1. 본 약관은 서비스를 이용하고자 하는 모든 회원에게 그 효력이 발생합니다.{'\n\n'}
              
              2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 
              약관이 변경되는 경우 변경사항을 시행일자 7일 전부터 공지합니다.{'\n\n'}
              
              3. 회원이 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제4조 (회원가입)</Text>
            <Text style={styles.articleContent}>
              1. 회원가입은 이용자가 약관의 내용에 동의한 후, 회사가 정한 가입 양식에 따라 회원정보를 
              기입하여 신청합니다.{'\n\n'}
              
              2. 회사는 다음 각 호의 경우 회원가입을 거부하거나 사후에 회원자격을 제한 또는 정지시킬 수 있습니다:{'\n'}
              • 타인의 명의를 이용한 경우{'\n'}
              • 허위 정보를 기재한 경우{'\n'}
              • 사회의 안녕질서 또는 미풍양속을 저해할 목적으로 신청한 경우{'\n'}
              • 기타 회사가 정한 이용 요건을 충족하지 못한 경우{'\n\n'}
              
              3. 회원가입 시점은 회사의 승낙이 회원에게 도달한 시점으로 합니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제5조 (서비스 이용)</Text>
            <Text style={styles.articleContent}>
              1. 서비스 이용시간은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 
              원칙으로 합니다. 다만, 정기점검 등의 필요로 회사가 정한 날이나 시간은 제외됩니다.{'\n\n'}
              
              2. 회사는 서비스를 일정범위로 분할하여 각 범위별로 이용가능 시간을 별도로 정할 수 있습니다.{'\n\n'}
              
              3. 회원은 회사가 제공하는 서비스를 본 약관, 회사의 이용정책, 기타 회사가 통지하는 내용에 
              따라 이용하여야 합니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제6조 (회원권 및 환불)</Text>
            <Text style={styles.articleContent}>
              1. 회원권은 구매 시점부터 효력이 발생하며, 회원권 종류에 따라 이용기간이 정해집니다.{'\n\n'}
              
              2. 회원권 환불 규정:{'\n'}
              • 이용 시작 전: 전액 환불{'\n'}
              • 이용 중: 사용 기간을 일할 계산하여 차감 후 환불{'\n'}
              • 회원의 귀책사유로 인한 해지 시: 위약금 부과 가능{'\n\n'}
              
              3. 환불 시 카드 결제 수수료 등 실 비용이 차감될 수 있습니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제7조 (개인정보 보호)</Text>
            <Text style={styles.articleContent}>
              1. 회사는 회원의 개인정보를 보호하기 위하여 관련 법령이 정하는 바를 준수합니다.{'\n\n'}
              
              2. 개인정보의 수집, 이용, 제공 등에 관한 사항은 별도의 개인정보 처리방침에 따릅니다.{'\n\n'}
              
              3. 회사는 회원의 개인정보를 회원의 동의 없이 제3자에게 제공하지 않습니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제8조 (회사의 의무)</Text>
            <Text style={styles.articleContent}>
              1. 회사는 관련 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며, 
              계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다합니다.{'\n\n'}
              
              2. 회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보 보호를 위해 보안시스템을 
              구축하고 개인정보처리방침을 공시하고 준수합니다.{'\n\n'}
              
              3. 회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우 
              이를 처리하여야 합니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제9조 (회원의 의무)</Text>
            <Text style={styles.articleContent}>
              1. 회원은 다음 행위를 하여서는 안 됩니다:{'\n'}
              • 신청 또는 변경 시 허위내용 등록{'\n'}
              • 타인의 정보 도용{'\n'}
              • 회사가 게시한 정보의 변경{'\n'}
              • 회사가 정한 정보 이외의 정보 등의 송신 또는 게시{'\n'}
              • 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해{'\n'}
              • 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위{'\n'}
              • 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보 공개 또는 게시{'\n\n'}
              
              2. 회원은 관계법령, 본 약관의 규정, 이용안내 및 서비스상에 공지한 주의사항, 
              회사가 통지하는 사항 등을 준수하여야 합니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제10조 (면책조항)</Text>
            <Text style={styles.articleContent}>
              1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 
              서비스 제공에 관한 책임이 면제됩니다.{'\n\n'}
              
              2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.{'\n\n'}
              
              3. 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 
              그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제11조 (분쟁의 해결)</Text>
            <Text style={styles.articleContent}>
              1. 회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 
              피해보상처리기구를 설치·운영합니다.{'\n\n'}
              
              2. 회사와 회원 간에 발생한 분쟁은 전자거래기본법 제28조 및 동 시행령 제15조에 의하여 
              설치된 전자거래분쟁조정위원회의 조정에 따를 수 있습니다.{'\n\n'}
              
              3. 본 약관에 명시되지 않은 사항은 관련 법령 및 상관습에 따릅니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleTitle}>제12조 (관할법원)</Text>
            <Text style={styles.articleContent}>
              회사와 회원 간 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerTitle}>🏢 펌피 (Pumpy)</Text>
            <Text style={styles.footerText}>
              사업자등록번호: 123-45-67890{'\n'}
              대표자: 홍길동{'\n'}
              주소: 서울특별시 강남구 테헤란로 123{'\n'}
              고객센터: 02-1234-5678{'\n'}
              이메일: support@pumpy.com
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
    fontSize: 22,
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
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center'
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30
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
    borderTopColor: '#f0f0f0'
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center'
  },
  footerText: {
    fontSize: 13,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center'
  }
})

