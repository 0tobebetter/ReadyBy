import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

type Lang = "en" | "ko";

const content = {
  en: {
    back: "← Back",
    title: "Privacy Policy",
    updated: "Last updated: May 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We use Google Analytics 4 (GA4) to collect anonymous visit statistics. This may include:\n\n• Browser type and version\n• Operating system\n• Country / region of access\n• Pages visited and time spent\n• Referring URL\n\nThis data is collected via cookies and is fully anonymized. We do not collect names, email addresses, or any directly identifying information. Your task inputs are processed locally in your browser and never sent to our servers.",
      },
      {
        heading: "2. Purpose of Data Collection",
        body: "The data collected through GA4 is used solely to:\n\n• Understand how users interact with ReadyBy\n• Improve the user experience\n• Measure overall usage trends\n\nWe do not use this data for advertising or sell it to third parties.",
      },
      {
        heading: "3. Data Retention",
        body: "Google Analytics 4 retains user-level data for up to 14 months by default. Aggregated statistics may be retained indefinitely. You can request deletion of your data at any time (see Section 5).",
      },
      {
        heading: "4. Third-Party Services",
        body: "We use Google Analytics 4, operated by Google LLC (1600 Amphitheatre Parkway, Mountain View, CA 94043, USA). Google processes data under its own Privacy Policy and complies with applicable data protection laws including GDPR.\n\nFor more information on how Google handles data:\nhttps://policies.google.com/privacy",
      },
      {
        heading: "5. Your Rights",
        body: "You have the right to:\n\n• Withdraw consent at any time by clicking 'Decline' on the cookie banner or clearing your browser's local storage\n• Request access to or deletion of data held by Google Analytics (via Google's data deletion tools)\n• Opt out of Google Analytics tracking entirely using the Google Analytics Opt-out Browser Add-on\n\nWithdrawing consent will not affect the lawfulness of any processing carried out prior to withdrawal.",
      },
      {
        heading: "6. Cookies",
        body: "ReadyBy uses the following cookies:\n\n• _ga, _ga_* — set by Google Analytics 4 to distinguish users and sessions. These cookies expire after 2 years and 13 months respectively.\n\nNo other cookies are set by this site.",
      },
      {
        heading: "7. Contact",
        body: "If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:\n\nprivacy@readyby.app",
      },
    ],
    copyright: "© 2026 ReadyBy",
  },
  ko: {
    back: "← 돌아가기",
    title: "개인정보처리방침",
    updated: "최종 수정일: 2026년 5월",
    sections: [
      {
        heading: "1. 수집하는 개인정보 항목",
        body: "ReadyBy는 Google Analytics 4 (GA4)를 통해 다음과 같은 익명 방문 통계를 수집합니다.\n\n• 브라우저 종류 및 버전\n• 운영체제\n• 접속 국가 / 지역\n• 방문 페이지 및 체류 시간\n• 유입 경로(참조 URL)\n\n위 정보는 쿠키를 통해 수집되며 완전히 익명화됩니다. 이름, 이메일 주소 등 직접 식별 가능한 정보는 수집하지 않습니다. 사용자가 입력하는 할 일 내용은 브라우저 내에서만 처리되며, 서버로 전송되거나 저장되지 않습니다.",
      },
      {
        heading: "2. 개인정보 수집 및 이용 목적",
        body: "GA4를 통해 수집되는 데이터는 다음 목적으로만 활용됩니다.\n\n• ReadyBy 사용 현황 파악\n• 사용자 경험 개선\n• 전반적인 이용 추세 분석\n\n광고 목적으로 활용하거나 제3자에게 판매하지 않습니다.",
      },
      {
        heading: "3. 개인정보 보유 및 이용기간",
        body: "Google Analytics 4는 기본적으로 사용자 수준 데이터를 최대 14개월간 보유합니다. 집계된 통계 데이터는 무기한 보유될 수 있습니다. 이용자는 언제든지 데이터 삭제를 요청할 수 있습니다(5항 참조).",
      },
      {
        heading: "4. 개인정보의 제3자 제공",
        body: "ReadyBy는 Google LLC(미국 캘리포니아 주 마운틴뷰 소재)가 운영하는 Google Analytics 4를 사용합니다. Google은 자체 개인정보처리방침에 따라 데이터를 처리하며, GDPR 등 관련 데이터 보호 법규를 준수합니다.\n\nGoogle의 데이터 처리 방식에 대한 자세한 내용:\nhttps://policies.google.com/privacy",
      },
      {
        heading: "5. 이용자의 권리 및 행사방법",
        body: "이용자는 다음과 같은 권리를 보유합니다.\n\n• 쿠키 배너에서 '동의 안 함'을 선택하거나 브라우저 로컬스토리지를 초기화하여 언제든지 동의를 철회할 수 있습니다.\n• Google Analytics가 보유한 데이터에 대해 열람·삭제를 요청할 수 있습니다(Google 데이터 삭제 도구 이용).\n• Google Analytics 추적 차단 브라우저 부가기능을 통해 트래킹을 완전히 차단할 수 있습니다.\n\n동의 철회는 철회 이전에 이루어진 처리의 적법성에는 영향을 미치지 않습니다.",
      },
      {
        heading: "6. 쿠키 사용",
        body: "ReadyBy에서 사용하는 쿠키는 다음과 같습니다.\n\n• _ga, _ga_* — Google Analytics 4가 사용자 및 세션을 구분하기 위해 설정하는 쿠키입니다. 각각 2년, 13개월 후 만료됩니다.\n\n이 외에 다른 쿠키는 사용하지 않습니다.",
      },
      {
        heading: "7. 문의",
        body: "개인정보처리방침에 관한 문의 또는 권리 행사를 원하시면 아래로 연락해 주세요.\n\nprivacy@readyby.app",
      },
    ],
    copyright: "© 2026 ReadyBy",
  },
};

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Lang) || "en";
    }
    return "en";
  });

  const toggleLang = () => {
    const next = lang === "en" ? "ko" : "en";
    setLang(next);
    if (typeof window !== "undefined") localStorage.setItem("lang", next);
  };

  const C = content[lang];

  return (
    <View style={styles.outer}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.container}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{C.back}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
            <Text style={styles.langBtnText}>
              {lang === "en" ? "한" : "EN"} ⇄ {lang === "en" ? "EN" : "한"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{C.title}</Text>
        <Text style={styles.updated}>{C.updated}</Text>

        {C.sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{C.copyright}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    padding: 24,
    paddingTop: 24,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  backBtnText: {
    fontSize: 14,
    color: "#888",
  },
  langBtn: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    marginBottom: 8,
    color: "#000",
  },
  updated: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  sectionBody: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#aaa",
  },
});
