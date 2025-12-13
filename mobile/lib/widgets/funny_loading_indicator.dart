import 'package:flutter/material.dart';
import 'dart:math' as math;

class FunnyLoadingIndicator extends StatefulWidget {
  final Color? color;
  final double size;

  const FunnyLoadingIndicator({super.key, this.color, this.size = 50.0});

  @override
  State<FunnyLoadingIndicator> createState() => _FunnyLoadingIndicatorState();
}

class _FunnyLoadingIndicatorState extends State<FunnyLoadingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? Theme.of(context).primaryColor;

    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Stack(
            children: List.generate(3, (index) {
              final delay = index * 0.2;
              final value = (_controller.value + delay) % 1.0;
              final angle = value * 2 * math.pi;
              final offset = Offset(
                math.cos(angle) * (widget.size / 4),
                math.sin(angle) * (widget.size / 4),
              );

              return Transform.translate(
                offset: offset,
                child: Center(
                  child: Container(
                    width: widget.size / 4,
                    height: widget.size / 4,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 1 - value),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              );
            }),
          );
        },
      ),
    );
  }
}
