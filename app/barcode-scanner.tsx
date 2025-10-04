import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function BarcodeScannerScreen() {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        
        // Formatar o código de barras (remover espaços e caracteres especiais)
        const formattedBarcode = data.replace(/[^\d]/g, '');
        
        if (formattedBarcode.length >= 8) {
            Alert.alert(
                'Código de Barras Lido!',
                `Código: ${formattedBarcode}`,
                [
                    {
                        text: 'Usar este código',
                        onPress: () => {
                            // Retornar para a tela anterior com o código
                            router.back();
                            // Usar um evento ou callback para passar o código
                            // Por enquanto, vamos usar um Alert para demonstrar
                            setTimeout(() => {
                                Alert.alert(
                                    'Código de Barras',
                                    `Código ${formattedBarcode} pronto para uso!\n\nVocê pode integrar com uma API de produtos para buscar o preço automaticamente.`
                                );
                            }, 500);
                        }
                    },
                    {
                        text: 'Ler novamente',
                        onPress: () => setScanned(false)
                    }
                ]
            );
        } else {
            Alert.alert(
                'Código Inválido',
                'O código de barras lido parece ser inválido. Tente novamente.',
                [
                    {
                        text: 'Tentar novamente',
                        onPress: () => setScanned(false)
                    }
                ]
            );
        }
    };

    const toggleFlash = () => {
        setFlashMode(flashMode === 'off' ? 'on' : 'off');
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Solicitando permissão da câmera...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Sem acesso à câmera</Text>
                <Text style={styles.subMessage}>
                    É necessário permitir o acesso à câmera para usar o scanner.
                </Text>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => router.back()}
                >
                    <Text style={styles.buttonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: [
                        'ean13',
                        'ean8', 
                        'upc_e',
                        'code39',
                        'code128'
                    ],
                }}
                flash={flashMode}
            >
                <View style={styles.overlay}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backButtonText}>✕</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.title}>Scanner de Código de Barras</Text>
                        
                        <TouchableOpacity 
                            style={styles.flashButton}
                            onPress={toggleFlash}
                        >
                            <Text style={styles.flashButtonText}>
                                {flashMode === 'on' ? '🔦' : '⚡'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Área de scanning */}
                    <View style={styles.scanArea}>
                        <View style={styles.scanFrame}>
                            <View style={styles.cornerTopLeft} />
                            <View style={styles.cornerTopRight} />
                            <View style={styles.cornerBottomLeft} />
                            <View style={styles.cornerBottomRight} />
                        </View>
                        
                        <Text style={styles.scanInstruction}>
                            Posicione o código de barras dentro do quadro
                        </Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            O scanner detectará automaticamente
                        </Text>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const { width, height } = Dimensions.get('window');
const scanFrameSize = width * 0.7;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    flashButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flashButtonText: {
        fontSize: 18,
        color: 'white',
    },
    scanArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scanFrame: {
        width: scanFrameSize,
        height: scanFrameSize * 0.5,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'transparent',
        marginBottom: 20,
    },
    cornerTopLeft: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: 30,
        height: 30,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#4CAF50',
    },
    cornerTopRight: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 30,
        height: 30,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#4CAF50',
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: -2,
        left: -2,
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#4CAF50',
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#4CAF50',
    },
    scanInstruction: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
    },
    message: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    subMessage: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        opacity: 0.8,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});