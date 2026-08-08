# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster-${var.environment}"

  tags = {
    Name        = "${var.project_name}-cluster-${var.environment}"
    Environment = var.environment
  }
}

# CloudWatch Log Group for all ECS Services
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 7
}

# Private Service Discovery Namespace
resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "service.local"
  description = "Private service discovery namespace for PrepSphere microservices"
  vpc         = aws_vpc.main.id
}

# ==========================================
# Infrastructure Containers: Redis & RabbitMQ
# ==========================================

# 1. Redis Service Discovery
resource "aws_service_discovery_service" "redis" {
  name = "redis"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

# Redis Task Definition
resource "aws_ecs_task_definition" "redis" {
  family                   = "${var.project_name}-redis-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "redis"
      image     = "redis:7-alpine"
      essential = true
      portMappings = [
        {
          containerPort = 6379
          hostPort      = 6379
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "redis"
        }
      }
    }
  ])
}

# Redis Service
resource "aws_ecs_service" "redis" {
  name            = "${var.project_name}-redis-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.redis.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.redis.arn
  }
}

# 2. RabbitMQ Service Discovery
resource "aws_service_discovery_service" "rabbitmq" {
  name = "rabbitmq"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

# RabbitMQ Task Definition
resource "aws_ecs_task_definition" "rabbitmq" {
  family                   = "${var.project_name}-rabbitmq-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "rabbitmq"
      image     = "rabbitmq:3-management"
      essential = true
      portMappings = [
        {
          containerPort = 5672
          hostPort      = 5672
        },
        {
          containerPort = 15672
          hostPort      = 15672
        }
      ]
      environment = [
        { name = "RABBITMQ_DEFAULT_USER", value = "guest" },
        { name = "RABBITMQ_DEFAULT_PASS", value = "guest" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "rabbitmq"
        }
      }
    }
  ])
}

# RabbitMQ Service
resource "aws_ecs_service" "rabbitmq" {
  name            = "${var.project_name}-rabbitmq-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.rabbitmq.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.rabbitmq.arn
  }
}

# ==========================================
# Application Microservices
# ==========================================

# Reusable local values for services config
locals {
  shared_env = [
    { name = "REDIS_URL", value = "redis://redis.service.local:6379" },
    { name = "RABBITMQ_URL", value = "amqp://rabbitmq.service.local:5672" }
  ]
}

# 3. Auth Service
resource "aws_service_discovery_service" "auth_service" {
  name = "auth-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_ecs_task_definition" "auth_service" {
  family                   = "${var.project_name}-auth-service-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "auth-service"
      image     = "${aws_ecr_repository.repo["auth-service"].repository_url}:${var.image_tag}"
      essential = true
      portMappings = [
        { containerPort = 8001, hostPort = 8001 },
        { containerPort = 50051, hostPort = 50051 }
      ]
      environment = concat(local.shared_env, [
        { name = "PORT", value = "8001" },
        { name = "POSTGRES_URL", value = var.postgres_url }
      ])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "auth-service"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "auth_service" {
  name            = "${var.project_name}-auth-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.auth_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.auth_service.arn
  }

  depends_on = [aws_ecs_service.redis, aws_ecs_service.rabbitmq]
}

# 4. Billing Service
resource "aws_service_discovery_service" "billing_service" {
  name = "billing-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_ecs_task_definition" "billing_service" {
  family                   = "${var.project_name}-billing-service-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name         = "billing-service"
      image        = "${aws_ecr_repository.repo["billing-service"].repository_url}:${var.image_tag}"
      essential    = true
      portMappings = [{ containerPort = 8002, hostPort = 8002 }]
      environment = concat(local.shared_env, [
        { name = "PORT", value = "8002" },
        { name = "POSTGRES_URL", value = var.postgres_url },
        { name = "RAZORPAY_KEY_ID", value = var.razorpay_key_id },
        { name = "RAZORPAY_KEY_SECRET", value = var.razorpay_key_secret },
        { name = "RAZORPAY_WEBHOOK_SECRET", value = var.razorpay_webhook_secret }
      ])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "billing-service"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "billing_service" {
  name            = "${var.project_name}-billing-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.billing_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.billing_service.arn
  }

  depends_on = [aws_ecs_service.redis, aws_ecs_service.rabbitmq]
}

# 5. Interview Service
resource "aws_service_discovery_service" "interview_service" {
  name = "interview-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_ecs_task_definition" "interview_service" {
  family                   = "${var.project_name}-interview-service-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name         = "interview-service"
      image        = "${aws_ecr_repository.repo["interview-service"].repository_url}:${var.image_tag}"
      essential    = true
      portMappings = [{ containerPort = 8003, hostPort = 8003 }]
      environment = concat(local.shared_env, [
        { name = "PORT", value = "8003" },
        { name = "MONGODB_URL", value = var.mongodb_url },
        { name = "GROQ_API_KEY", value = var.groq_api_key }
      ])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "interview-service"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "interview_service" {
  name            = "${var.project_name}-interview-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.interview_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.interview_service.arn
  }

  depends_on = [aws_ecs_service.redis, aws_ecs_service.rabbitmq, aws_ecs_service.auth_service]
}

# 6. Resume Service
resource "aws_service_discovery_service" "resume_service" {
  name = "resume-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_ecs_task_definition" "resume_service" {
  family                   = "${var.project_name}-resume-service-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name         = "resume-service"
      image        = "${aws_ecr_repository.repo["resume-service"].repository_url}:${var.image_tag}"
      essential    = true
      portMappings = [{ containerPort = 8004, hostPort = 8004 }]
      environment = concat(local.shared_env, [
        { name = "PORT", value = "8004" },
        { name = "MONGODB_URL", value = var.mongodb_url },
        { name = "GROQ_API_KEY", value = var.groq_api_key }
      ])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "resume-service"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "resume_service" {
  name            = "${var.project_name}-resume-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.resume_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.resume_service.arn
  }

  depends_on = [aws_ecs_service.redis, aws_ecs_service.rabbitmq, aws_ecs_service.auth_service]
}

# 7. Roadmap Service
resource "aws_service_discovery_service" "roadmap_service" {
  name = "roadmap-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_ecs_task_definition" "roadmap_service" {
  family                   = "${var.project_name}-roadmap-service-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name         = "roadmap-service"
      image        = "${aws_ecr_repository.repo["roadmap-service"].repository_url}:${var.image_tag}"
      essential    = true
      portMappings = [{ containerPort = 8005, hostPort = 8005 }]
      environment = concat(local.shared_env, [
        { name = "PORT", value = "8005" },
        { name = "MONGODB_URL", value = var.mongodb_url },
        { name = "GROQ_API_KEY", value = var.groq_api_key }
      ])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "roadmap-service"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "roadmap_service" {
  name            = "${var.project_name}-roadmap-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.roadmap_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.roadmap_service.arn
  }

  depends_on = [aws_ecs_service.redis, aws_ecs_service.rabbitmq, aws_ecs_service.auth_service]
}

# 8. API Gateway
resource "aws_service_discovery_service" "gateway" {
  name = "gateway"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_ecs_task_definition" "gateway" {
  family                   = "${var.project_name}-gateway-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name         = "gateway"
      image        = "${aws_ecr_repository.repo["gateway"].repository_url}:${var.image_tag}"
      essential    = true
      portMappings = [{ containerPort = 8000, hostPort = 8000 }]
      environment = concat(local.shared_env, [
        { name = "AUTH_SERVICE_URL", value = "http://auth-service.service.local:8001" },
        { name = "AUTH_SERVICE_GRPC_URL", value = "auth-service.service.local:50051" },
        { name = "BILLING_SERVICE_URL", value = "http://billing-service.service.local:8002" },
        { name = "INTERVIEW_SERVICE_URL", value = "http://interview-service.service.local:8003" },
        { name = "RESUME_SERVICE_URL", value = "http://resume-service.service.local:8004" },
        { name = "ROADMAP_SERVICE_URL", value = "http://roadmap-service.service.local:8005" },
        { name = "FRONTEND_URL", value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}" }
      ])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "gateway"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "gateway" {
  name            = "${var.project_name}-gateway-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.gateway.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.gateway.arn
    container_name   = "gateway"
    container_port   = 8000
  }

  service_registries {
    registry_arn = aws_service_discovery_service.gateway.arn
  }

  depends_on = [
    aws_ecs_service.auth_service,
    aws_ecs_service.billing_service,
    aws_ecs_service.interview_service,
    aws_ecs_service.resume_service,
    aws_ecs_service.roadmap_service,
    aws_lb_listener.http
  ]
}
