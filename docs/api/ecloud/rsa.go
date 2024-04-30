package rsa

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"net/http"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	pubKeyB64 := r.URL.Query().Get("pubkey")
	username := r.URL.Query().Get("username")
	password := r.URL.Query().Get("password")

	w.Header().Set("Content-Type", "application/json")

	if pubKeyB64 == "" {
		w.WriteHeader(http.StatusBadRequest)

		w.Write(
			[]byte(`{"error": "缺少 'pubkey' 参数"}`),
		)
		return
	}

	if username == "" || password == "" {
		w.WriteHeader(http.StatusBadRequest)

		w.Write(
			[]byte(`{"error": "缺少 'username' 或 'password' 参数"}`),
		)
		return
	}

	pubKey := fmt.Sprintf("-----BEGIN PUBLIC KEY-----\n%s\n-----END PUBLIC KEY-----", pubKeyB64)

	// 调用encrypt函数进行加密
	usernameText, err := encrypt(pubKey, username)
	if err != nil {
		w.Write([]byte(`{"error": "username 加密失败"}`))
		return
	}

	passwordText, err := encrypt(pubKey, password)
	if err != nil {
		w.Write([]byte(`{"error": "password 加密失败"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	resp := make(map[string]string)
	resp["username"] = fmt.Sprintf("%x", usernameText)
	resp["password"] = fmt.Sprintf("%x", passwordText)

	jsonResp, err := json.Marshal(resp)

	if err != nil {
		w.Write([]byte(`{"error": "加密失败"}`))
	} else {
		w.Write(jsonResp)
	}

}

// encrypt 使用RSA公钥加密文本
func encrypt(pubkey string, text string) ([]byte, error) {
	// 解码PEM格式的公钥
	block, _ := pem.Decode([]byte(pubkey))
	if block == nil {
		return nil, fmt.Errorf("failed to parse PEM block containing the public key")
	}

	// 解析公钥
	pubKey, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	rsaPubKey, ok := pubKey.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("type assertion to *rsa.PublicKey failed")
	}

	// 加密数据
	ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, rsaPubKey, []byte(text))
	if err != nil {
		return nil, err
	}

	return ciphertext, nil
}
