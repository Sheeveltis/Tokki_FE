import { useState } from 'react'
import { View, StyleSheet, Text, Pressable, useWindowDimensions, Linking } from 'react-native'

const linkGroups = [
  {
    title: 'Học tập',
    links: [
      { label: 'Luyện thi TOPIK', url: 'https://example.com' },
      { label: 'Từ vựng mỗi ngày', url: 'https://example.com' },
      { label: 'Ngữ pháp cơ bản', url: 'https://example.com' },
      { label: 'Đề thi thử', url: 'https://example.com' },
    ],
  },
  {
    title: 'Tokki',
    links: [
      { label: 'Về chúng tôi', url: 'https://example.com' },
      { label: 'Đội ngũ giáo viên', url: 'https://example.com' },
      { label: 'Blog học tiếng Hàn', url: 'https://example.com' },
      { label: 'Liên hệ', url: 'https://example.com' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Hướng dẫn học tập', url: 'https://example.com' },
      { label: 'Cộng đồng Tokki', url: 'https://example.com' },
      { label: 'Giải đáp thắc mắc', url: 'https://example.com' },
      { label: 'Chính sách bảo mật', url: 'https://example.com' },
    ],
  },
  {
    title: 'Kết nối',
    links: [
      { label: 'Facebook', url: 'https://facebook.com' },
      { label: 'YouTube', url: 'https://youtube.com' },
      { label: 'TikTok', url: 'https://tiktok.com' },
      { label: 'Instagram', url: 'https://instagram.com' },
    ],
  },
]

const partners = [
  'Viện Giáo dục Quốc tế Quốc gia (NIIED)',
  'Trung tâm Ngôn ngữ Tiếng Hàn TP.HCM',
];
export const Footer = ({ style }) => {
  const { width } = useWindowDimensions()
  const isTablet = width < 1100
  const isMobile = width < 760
  const [hoveredLink, setHoveredLink] = useState(null)

  const handleOpenLink = (url) => {
    if (!url || url === '#') return
    Linking.openURL(url)
  }

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.footer}>
        <View style={[styles.inner, isTablet && styles.innerTablet]}>
          <View style={[styles.topGrid, isMobile && styles.topGridMobile]}>
            <View style={styles.brandCol}>
              <Text style={styles.logo}>TOKKI</Text>
              <Text style={styles.brandDesc}>
                Người bạn đồng hành thông minh trên con đường chinh phục tiếng Hàn và tấm bằng TOPIK của bạn.
              </Text>
              <Text style={styles.readMore}>Tìm hiểu thêm về lộ trình →</Text>
            </View>

            <View style={[styles.linksGrid, isMobile && styles.linksGridMobile]}>
              {linkGroups.map((group, idx) => (
                <View key={group.title} style={[styles.linkCol, idx < linkGroups.length - 1 && styles.linkColDivider]}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  {group.links.map((link) => {
                    const linkKey = `${group.title}-${link.label}`
                    const isHovered = hoveredLink === linkKey

                    return (
                      <Pressable
                        key={link.label}
                        onPress={() => handleOpenLink(link.url)}
                        onHoverIn={() => setHoveredLink(linkKey)}
                        onHoverOut={() => setHoveredLink(null)}
                        style={styles.linkPressable}
                      >
                        <Text style={[styles.linkText, isHovered && styles.linkTextHover]}>{link.label}</Text>
                      </Pressable>
                    )
                  })}
                </View>
              ))}
            </View>
          </View>
          {/* 
          <View style={styles.divider} />

          <View style={[styles.partnerRow, isMobile && styles.partnerRowMobile]}>
            <Text style={styles.partnerLabel}>Đối tác giáo dục:</Text>
            <View style={styles.partnerList}>
              {partners.map((item) => (
                <Text key={item} style={styles.partnerItem}>⦿ {item}</Text>
              ))}
            </View>
            <Text style={styles.seeAll}>Tất cả đối tác →</Text>
          </View>

          <View style={styles.divider} /> */}

          <View style={[styles.bottomRow, isMobile && styles.bottomRowMobile]}>
            <Text style={styles.copyText}>
              Bản quyền ©2026. Phát triển bởi Tokki Team | Chúc bạn học tốt! (화이팅!)
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  newsletterWrap: {
    width: '56%',
    maxWidth: 1200,
    minWidth: 500,
    height: 56,
    alignSelf: 'center',
    marginBottom: -28,
    zIndex: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  newsletterWrapMobile: {
    width: '92%',
    minWidth: 0,
  },
  input: {
    flex: 1,
    fontSize: 22,
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  button: {
    height: 48,
    borderRadius: 999,
    backgroundColor: '#B79A73',
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: 'Epilogue, sans-serif',
  },
  footer: {
    backgroundColor: '#38393B',
    // opacity: 0.7,
    paddingTop: 50,
    paddingBottom: 40,
  },
  inner: {
    width: '80%',
    maxWidth: 1500,
    alignSelf: 'center',
  },
  innerTablet: {
    width: '90%',
  },
  topGrid: {
    flexDirection: 'row',
    columnGap: 28,
  },
  topGridMobile: {
    flexDirection: 'column',
    rowGap: 28,
  },
  brandCol: {
    width: 300,
    maxWidth: '100%',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 14,
    fontFamily: 'Epilogue, sans-serif',
  },
  brandDesc: {
    color: '#8B909A',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: 'Epilogue, sans-serif',
  },
  readMore: {
    color: '#D0B287',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  linksGrid: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 8,
  },
  linksGridMobile: {
    flexWrap: 'wrap',
    rowGap: 18,
  },
  linkCol: {
    flex: 1,
    minWidth: 130,
    paddingHorizontal: 12,
  },
  linkColDivider: {
    borderRightWidth: 1,
    borderRightColor: '#1E2633',
  },
  groupTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Epilogue, sans-serif',
  },
  linkText: {
    color: '#98A0AE',
    fontSize: 15,
    lineHeight: 30,
    fontFamily: 'Epilogue, sans-serif',
    transitionDuration: '180ms',
  },
  linkTextHover: {
    color: '#D0B287',
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: '#1B2430',
    marginTop: 28,
    marginBottom: 22,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  partnerRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  partnerLabel: {
    color: '#A0A7B5',
    fontSize: 14,
    minWidth: 120,
    fontFamily: 'Epilogue, sans-serif',
  },
  partnerList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  partnerItem: {
    color: '#9EA5B4',
    fontSize: 13,
    fontFamily: 'Epilogue, sans-serif',
  },
  seeAll: {
    color: '#D0B287',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  bottomRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  copyText: {
    color: '#9AA1AE',
    fontSize: 13,
    flex: 1,
    fontFamily: 'Epilogue, sans-serif',
  },
  bottomLinks: {
    flexDirection: 'row',
    gap: 18,
  },
  bottomLink: {
    color: '#C1C7D3',
    fontSize: 14,
    fontFamily: 'Epilogue, sans-serif',
  },
})
