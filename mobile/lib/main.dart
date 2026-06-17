import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const AuraMobileApp());
}

class AuraMobileApp extends StatelessWidget {
  const AuraMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AuraMobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        fontFamily: 'Outfit',
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    
    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0F172A), // Slate 900
              Color(0xFF1E1B4B), // Indigo 950
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo header
              ScaleTransition(
                scale: _scaleAnimation,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white.withOpacity(0.1),
                      width: 1.5,
                    ),
                  ),
                  child: const Icon(
                    Icons.fingerprint,
                    size: 80,
                    color: Color(0xFF818CF8), // Indigo 400
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'AURA MOBILE',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2.0,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'SS Labz Enterprise HR Portal',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.6),
                ),
              ),
              const SizedBox(height: 48),
              // Biometric Sign In button
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(
                      builder: (context) => const HomeScreen(empId: 'EMP001'),
                    ),
                  );
                },
                icon: const Icon(Icons.login),
                label: const Text('Bypass with Biometrics'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
