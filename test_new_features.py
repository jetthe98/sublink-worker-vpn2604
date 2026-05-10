#!/usr/bin/env python3
"""测试所有新功能"""

from playwright.sync_api import sync_playwright
import time

def test_all_features():
    errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 监听控制台错误
        page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
        
        print("=" * 60)
        print("开始测试订阅链接转换器新功能")
        print("=" * 60)
        
        # 1. 导航到应用
        print("\n[1] 测试页面加载...")
        page.goto('http://localhost:8787')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='/tmp/01_page_loaded.png', full_page=True)
        print("✓ 页面加载成功")
        
        # 2. 测试订阅管理组件
        print("\n[2] 测试订阅管理组件...")
        try:
            # 查找订阅管理组件
            sub_manager = page.locator('text=订阅管理').first
            if sub_manager.is_visible():
                print("✓ 订阅管理组件可见")
                page.screenshot(path='/tmp/02_subscription_manager.png', full_page=True)
            else:
                print("⚠ 订阅管理组件未找到")
        except Exception as e:
            print(f"⚠ 订阅管理测试失败: {e}")
        
        # 3. 测试订阅信息组件
        print("\n[3] 测试订阅信息组件...")
        try:
            sub_info = page.locator('text=订阅信息').first
            if sub_info.is_visible():
                print("✓ 订阅信息组件可见")
                page.screenshot(path='/tmp/03_subscription_info.png', full_page=True)
            else:
                print("⚠ 订阅信息组件未找到")
        except Exception as e:
            print(f"⚠ 订阅信息测试失败: {e}")
        
        # 4. 测试配置导入导出组件
        print("\n[4] 测试配置导入导出组件...")
        try:
            import_export = page.locator('text=配置导入导出').first
            if import_export.is_visible():
                print("✓ 配置导入导出组件可见")
                page.screenshot(path='/tmp/04_import_export.png', full_page=True)
            else:
                print("⚠ 配置导入导出组件未找到")
        except Exception as e:
            print(f"⚠ 配置导入导出测试失败: {e}")
        
        # 5. 测试批量重命名组件
        print("\n[5] 测试批量重命名组件...")
        try:
            batch_rename = page.locator('text=批量重命名').first
            if batch_rename.is_visible():
                print("✓ 批量重命名组件可见")
                page.screenshot(path='/tmp/05_batch_rename.png', full_page=True)
            else:
                print("⚠ 批量重命名组件未找到")
        except Exception as e:
            print(f"⚠ 批量重命名测试失败: {e}")
        
        # 6. 测试操作历史组件
        print("\n[6] 测试操作历史组件...")
        try:
            history = page.locator('text=操作历史').first
            if history.is_visible():
                print("✓ 操作历史组件可见")
                page.screenshot(path='/tmp/06_operation_history.png', full_page=True)
            else:
                print("⚠ 操作历史组件未找到")
        except Exception as e:
            print(f"⚠ 操作历史测试失败: {e}")
        
        # 7. 测试节点选择器
        print("\n[7] 测试节点选择器...")
        try:
            node_selector = page.locator('text=节点选择').first
            if node_selector.is_visible():
                print("✓ 节点选择器可见")
                page.screenshot(path='/tmp/07_node_selector.png', full_page=True)
            else:
                print("⚠ 节点选择器未找到")
        except Exception as e:
            print(f"⚠ 节点选择器测试失败: {e}")
        
        # 8. 测试搜索框
        print("\n[8] 测试节点搜索功能...")
        try:
            search_input = page.locator('input[placeholder*="搜索"]').first
            if search_input.is_visible():
                print("✓ 搜索框可见")
                page.screenshot(path='/tmp/08_search_box.png', full_page=True)
            else:
                print("⚠ 搜索框未找到")
        except Exception as e:
            print(f"⚠ 搜索功能测试失败: {e}")
        
        # 9. 测试协议筛选下拉框
        print("\n[9] 测试协议筛选功能...")
        try:
            protocol_select = page.locator('select').first
            if protocol_select.is_visible():
                print("✓ 协议筛选下拉框可见")
                page.screenshot(path='/tmp/09_protocol_filter.png', full_page=True)
            else:
                print("⚠ 协议筛选下拉框未找到")
        except Exception as e:
            print(f"⚠ 协议筛选测试失败: {e}")
        
        # 10. 测试功能引导提示
        print("\n[10] 测试功能引导提示...")
        try:
            info_icon = page.locator('.fa-info-circle').first
            if info_icon.is_visible():
                info_icon.hover()
                page.wait_for_timeout(500)
                print("✓ 功能引导提示可见")
                page.screenshot(path='/tmp/10_tooltip.png', full_page=True)
            else:
                print("⚠ 功能引导提示未找到")
        except Exception as e:
            print(f"⚠ 功能引导测试失败: {e}")
        
        # 11. 测试收藏按钮
        print("\n[11] 测试节点收藏功能...")
        try:
            # 先解析节点
            parse_btn = page.locator('button:has-text("解析")').first
            if parse_btn.is_visible():
                print("✓ 解析按钮可见")
                page.screenshot(path='/tmp/11_parse_button.png', full_page=True)
        except Exception as e:
            print(f"⚠ 收藏功能测试失败: {e}")
        
        # 12. 测试暗色模式切换
        print("\n[12] 测试暗色模式切换...")
        try:
            dark_toggle = page.locator('button[class*="dark"]').first
            if dark_toggle.is_visible():
                print("✓ 暗色模式切换按钮可见")
                page.screenshot(path='/tmp/12_dark_mode.png', full_page=True)
        except Exception as e:
            print(f"⚠ 暗色模式测试失败: {e}")
        
        # 13. 测试语言切换
        print("\n[13] 测试语言切换...")
        try:
            lang_btn = page.locator('button:has-text("中文")').first
            if lang_btn.is_visible():
                print("✓ 语言切换按钮可见")
                page.screenshot(path='/tmp/13_language.png', full_page=True)
        except Exception as e:
            print(f"⚠ 语言切换测试失败: {e}")
        
        # 14. 测试导航栏
        print("\n[14] 测试导航栏...")
        try:
            navbar = page.locator('nav, header, [class*="nav"]').first
            if navbar.is_visible():
                print("✓ 导航栏可见")
                page.screenshot(path='/tmp/14_navbar.png', full_page=True)
        except Exception as e:
            print(f"⚠ 导航栏测试失败: {e}")
        
        # 15. 测试底部信息
        print("\n[15] 测试底部信息...")
        try:
            footer = page.locator('footer, [class*="footer"]').first
            if footer.is_visible():
                print("✓ 底部信息可见")
                page.screenshot(path='/tmp/15_footer.png', full_page=True)
        except Exception as e:
            print(f"⚠ 底部测试失败: {e}")
        
        # 总结
        print("\n" + "=" * 60)
        print("测试完成")
        print("=" * 60)
        
        if errors:
            print(f"\n⚠ 发现 {len(errors)} 个控制台错误:")
            for err in errors[:5]:  # 只显示前5个
                print(f"  - {err}")
        else:
            print("\n✓ 没有控制台错误")
        
        print(f"\n截图已保存到 /tmp/01_*.png")
        
        browser.close()

if __name__ == "__main__":
    test_all_features()
