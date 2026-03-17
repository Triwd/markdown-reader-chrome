# Markdown Reader 测试文档

欢迎使用 **Markdown Reader** Chrome 插件！这是一个测试文档，用来展示插件的各种功能。

## 功能特性

### 1. Markdown 渲染

支持标准 Markdown 语法：

- **粗体文本**
- *斜体文本*
- ~~删除线~~
- `行内代码`

### 2. 代码高亮

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
    return `Welcome to Markdown Reader`;
}

greet('User');
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

### 3. 表格支持

| 功能 | 支持 | 备注 |
|------|------|------|
| Markdown 渲染 | ✅ | 使用 marked.js |
| 大纲导航 | ✅ | 自动生成 |
| 主题切换 | ✅ | 亮色/暗色 |

### 4. 列表

有序列表：

1. 第一项
2. 第二项
3. 第三项

无序列表：

- 项目 A
- 项目 B
- 项目 C

嵌套列表：

- 父项目 1
  - 子项目 1.1
  - 子项目 1.2
- 父项目 2
  - 子项目 2.1

### 5. 引用

> Markdown 是一种轻量级标记语言，创始人为约翰·格鲁伯（John Gruber）。
> 
> 它允许人们使用易读易写的纯文本格式编写文档。

### 6. 任务列表

- [x] 完成插件基础功能
- [x] 添加大纲导航
- [x] 支持主题切换
- [ ] 添加导出功能
- [ ] 支持更多 Markdown 扩展

## 如何使用

1. 安装插件
2. 访问任意 `.md` 文件
3. 享受优雅的阅读体验！

## 链接和引用

访问 [GitHub](https://github.com) 查看更多项目。

## 结语

感谢使用 Markdown Reader！如果有任何问题或建议，欢迎反馈。

---

**提示**：左侧的大纲可以帮你快速导航到不同章节！